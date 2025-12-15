import './OrderManagement.css';
import '../Management.css';
import Button from '@mui/material/Button';

import PaginationComponent from '../../components/Pagination/PaginationComponent';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrderContext } from '../../context/OrderContext';

type OrderCreateDTO = {
  code: string;
  vatId: number;
  statusId: number;
  total: number;
  businessId: number;
  workerId?: number;
  orderDetails: OrderDetailRequest[];
};

type OrderDetailRequest = {
  itemId: number;
  priceWoVat: number;
  priceWtVat: number;
  quantity: number;
  addons?: Array<{ ingredientId: number; priceWoVat: number }>;
};

// TODO: Get from auth context
const VAT_ID_STANDARD = 1; // TODO: Get from VAT settings
const STATUS_ID_PENDING = 1; // TODO: Get from status enum

type Option = {
  nid: number;
  name: string;
  price: number;
};

type OptionGroup = {
  nid: number;
  name: string;
  options: Option[];
};

type MenuItem = {
  nid: number;
  name: string;
  price: number;
  vatId: number;
  addonGroups?: OptionGroup[];
};

type OrderDish = {
  nid: number;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions?: Record<number, number>;
  backendDetailNid?: number; // Track backend OrderDetail ID
};

type Order = {
  nid: number;
  items: OrderDish[];
  staff: string;
  backendNid?: number; // Track backend order ID
};

export default function OrderManagement() {
  const { orders, setOrders } = useOrderContext();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<OrderDish | null>(null);
  const [modalSelections, setModalSelections] = useState<
    Record<number, number>
  >({});

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [dishPage, setDishPage] = useState(1);
  const dishesPerPage = 8;

  const processedStateRef = useRef<string | null>(null);
  const pendingOrderRef = useRef<Order | null>(null);

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedOrders = orders.slice(start, end);

  const staffList = ['Alice', 'Bob', 'Charlie', 'Diana'];

  const toggleCancelMode = () => {
    setCancelMode((prev) => !prev);
  };

  const [businessId, setBusinessId] = useState<number | null>(null);
  const businessIdRef = useRef<number | null>(null);

  const updateBusinessId = (id: number | null) => {
    setBusinessId(id);
    businessIdRef.current = id;
  };

  // Fetch business ID
  const fetchBusinessId = async (): Promise<number> => {
    try {
      const response = await fetch('/api/auth/businessId', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access services');
        }
        throw new Error(`Failed to get business ID: ${response.statusText}`);
      }

      const id = await response.json();
      setBusinessId(id);
      console.log(id);
      return id;
    } catch (error) {
      console.error('Error fetching business ID:', error);
      throw error;
    }
  };

  // Load orders from database on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const id = await fetchBusinessId();
        updateBusinessId(id);
        
        // Fetch orders for this business
        const response = await fetch(`/api/orders/business/${id}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const backendOrders = await response.json();

        // Convert backend orders to frontend format
        const convertedOrders: (Order | null)[] = await Promise.all(
          backendOrders.map(async (backendOrder: any) => {
            try {
              // Fetch order details
              const detailsRes = await fetch(`/api/orders/${backendOrder.nid}/details`);
              if (!detailsRes.ok) throw new Error('Failed to fetch details');
              const details = await detailsRes.json();
              
              // Fetch addons for all details
              const allAddons: any[] = [];
              for (const detail of details) {
                const addonsRes = await fetch(`/api/orders/details/${detail.nid}/addons`);
                if (addonsRes.ok) {
                  const detailAddons = await addonsRes.json();
                  allAddons.push(...detailAddons);
                }
              }

              // Fetch menu items with their addon groups
              const items: (OrderDish | null)[] = await Promise.all(
                details.map(async (detail: any) => {
                  try {
                    // Fetch menu item
                    const itemRes = await fetch(`/api/menu/${detail.itemId}`);
                    if (!itemRes.ok) {
                      console.warn(`Menu item ${detail.itemId} not found, skipping detail ${detail.nid}`);
                      return null;
                    }
                    const menuItem = await itemRes.json();

                    // Fetch addon groups for this menu item
                    const groupsRes = await fetch(`/api/menu/addon-groups/by-menu-item/${menuItem.nid}`);
                    if (!groupsRes.ok) throw new Error('Failed to fetch groups');
                    const groups = await groupsRes.json();
                    
                    const addonGroups = await Promise.all(
                      groups.map(async (group: any) => {
                        const addonsRes = await fetch(`/api/menu/addons/by-group/${group.nid}`);
                        if (!addonsRes.ok) throw new Error('Failed to fetch addons');
                        const groupAddons = await addonsRes.json();
                        return {
                          nid: group.nid,
                          name: group.name,
                          options: groupAddons.map((addon: any) => ({
                            nid: addon.nid,
                            name: addon.name,
                            price: addon.price,
                          })),
                        };
                      })
                    );

                    // Find selected addons for this detail
                    const detailAddons = allAddons.filter(
                      (addon: any) => addon.detailId === detail.nid
                    );
                    const selectedOptions: Record<number, number> = {};

                    // Map addons to their groups
                    for (const addon of detailAddons) {
                      for (const group of addonGroups) {
                        const option = group.options.find(
                          (opt: any) => opt.nid === addon.ingredientId
                        );
                        if (option) {
                          selectedOptions[group.nid] = option.nid;
                          break;
                        }
                      }
                    }

                    return {
                      nid: detail.nid,
                      menuItem: {
                        nid: menuItem.nid,
                        name: menuItem.name,
                        price: menuItem.price,
                        vatId: menuItem.vatId,
                        addonGroups,
                      },
                      quantity: detail.quantity,
                      selectedOptions,
                      backendDetailNid: detail.nid,
                    };
                  } catch (error) {
                    console.error(
                      `Failed to load menu item ${detail.itemId}:`,
                      error
                    );
                    return null;
                  }
                })
              );

              // Filter out failed items
              const validItems = items.filter(
                (item): item is OrderDish => item !== null
              );

              return {
                nid: backendOrder.nid,
                items: validItems,
                staff: backendOrder.workerId
                  ? `Worker ${backendOrder.workerId}`
                  : '',
                backendNid: backendOrder.nid,
              };
            } catch (error) {
              console.error(`Failed to load order ${backendOrder.nid}:`, error);
              return null;
            }
          })
        );

        // Filter out failed orders
        const validOrders = convertedOrders.filter(
          (order): order is Order => order !== null
        );

        // Replace with saved orders from database (don't keep unsaved from previous session)
        setOrders(validOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load orders from database.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewOrder = () => {
    // Check if there's already an unsaved order
    const hasUnsavedOrder = orders.some((order) => !order.backendNid);

    if (hasUnsavedOrder) {
      setSnackbar({
        open: true,
        message:
          'Please save or cancel the existing unsaved order before creating a new one.',
        type: 'warning',
      });
      return;
    }

    const emptyOrder: Order = {
      nid: Date.now(),
      items: [],
      staff: '',
    };

    setOrders((prev) => [...prev, emptyOrder]);
    setSelectedOrder(emptyOrder);
    setOrderDirty(false);

    // Navigate to last page where the new order will be
    const newTotalOrders = orders.length + 1;
    const lastPage = Math.ceil(newTotalOrders / itemsPerPage);
    setPage(lastPage);
  };

  const handleOrderClick = (order: Order) => {
    if (!cancelMode) {
      // Find the order from the current orders state to ensure we have the latest data
      const currentOrder = orders.find((o) => o.nid === order.nid);
      if (currentOrder) {
        const orderCopy = JSON.parse(JSON.stringify(currentOrder));
        setSelectedOrder({ ...currentOrder });
        setOriginalOrder(orderCopy); // Store original state for deletion tracking
        setOrderDirty(false);
      }
    }
  };

  const handleCancelOrder = (orderNid: number) => {
    const order = orders.find((o) => o.nid === orderNid);
    if (order) {
      setOrderToDelete(order);
      setConfirmDeleteOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      // If order has backend ID, delete from backend
      if (orderToDelete.backendNid) {
        const response = await fetch(`/api/orders/${orderToDelete.backendNid}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete order');
      }

      // Remove from local state
      setOrders((prev) => prev.filter((o) => o.nid !== orderToDelete.nid));
      if (selectedOrder?.nid === orderToDelete.nid) {
        setSelectedOrder(null);
      }

      setSnackbar({
        open: true,
        message: 'Order deleted successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to delete order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete order. Please try again.',
        type: 'error',
      });
    } finally {
      setConfirmDeleteOpen(false);
      setOrderToDelete(null);
      setCancelMode(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setOrderToDelete(null);
  };

  const updateStaff = (staff: string) => {
    if (!selectedOrder) return;
    setSelectedOrder({ ...selectedOrder, staff });
    setOrderDirty(true);
  };

  const addDishToOrder = () => {
    if (selectedOrder) {
      navigate('/order-management/select-dish', {
        state: { orderId: selectedOrder.nid },
      });
    }
  };

  const updateQuantity = (nid: number, delta: number) => {
    if (!selectedOrder) return;

    const updated = selectedOrder.items.map((it) => {
      if (it.nid === nid) {
        const updatedItem = {
          ...it,
          quantity: Math.max(1, it.quantity + delta),
        };
        // Mark item as having quantity modified if it has a backend ID
        if ((it as any).backendDetailNid) {
          (updatedItem as any).quantityModified = true;
        }
        return updatedItem;
      }
      return it;
    });

    setSelectedOrder({ ...selectedOrder, items: updated });
    setOrderDirty(true);
  };

  const handleSave = async () => {
    if (!selectedOrder) return;

    try {
      // Calculate total with VAT (assuming 24% VAT rate)
      const vatRate = 1.24; // TODO: Get from VAT service

      // If order doesn't exist in backend yet, create it
      if (!selectedOrder.backendNid) {
        let total = 0;

        const orderDetails: OrderDetailRequest[] = selectedOrder.items.map(
          (item) => {
            const basePrice = item.menuItem.price;
            let addonsPriceWoVat = 0;

            // Calculate addons price
            const addons = (item.menuItem.addonGroups || []).flatMap(
              (group) => {
                const selectedOptionId = item.selectedOptions?.[group.nid];
                if (!selectedOptionId) return [];

                const option = group.options.find(
                  (opt) => opt.nid === selectedOptionId
                );
                if (!option) return [];

                addonsPriceWoVat += option.price;

                return [
                  {
                    ingredientId: option.nid,
                    priceWoVat: option.price,
                  },
                ];
              }
            );

            const itemPriceWoVat =
              (basePrice + addonsPriceWoVat) * item.quantity;
            const itemPriceWtVat = itemPriceWoVat * vatRate;
            total += itemPriceWtVat;

            return {
              itemId: item.menuItem.nid,
              priceWoVat: itemPriceWoVat,
              priceWtVat: itemPriceWtVat,
              quantity: item.quantity,
              addons: addons.length > 0 ? addons : undefined,
            };
          }
        );

        const orderData: OrderCreateDTO = {
          code: `ORD-${Date.now()}`,
          vatId: VAT_ID_STANDARD,
          statusId: STATUS_ID_PENDING,
          total: total,
          businessId:
            businessId ??
            (() => {
              throw new Error('Please login to access services');
            })(),
          workerId: selectedOrder.staff ? 1 : undefined, // TODO: Map staff name to worker ID
          orderDetails,
        };

        const createdOrderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        if (!createdOrderRes.ok) {
          const errorText = await createdOrderRes.text();
          console.error('Create order error:', errorText);
          throw new Error('Failed to create order');
        }
        const createdOrder = await createdOrderRes.json();
        console.log('Order created:', createdOrder);

        // Update the order with backend ID and backend detail IDs
        const detailsRes = await fetch(`/api/orders/${createdOrder.nid}/details`);
        if (!detailsRes.ok) {
          const errorText = await detailsRes.text();
          console.error('Fetch details error:', errorText);
          // If we can't fetch details, still mark order as created but continue
          const updatedOrder = {
            ...selectedOrder,
            backendNid: createdOrder.nid,
            items: selectedOrder.items,
          };
          setSelectedOrder(updatedOrder);
          setOriginalOrder(JSON.parse(JSON.stringify(updatedOrder)));
          setOrders((prev) =>
            prev.map((o) => (o.nid === selectedOrder.nid ? updatedOrder : o))
          );
          setOrderDirty(false);
          setSnackbar({
            open: true,
            message: 'Order created successfully!',
            type: 'success',
          });
          return;
        }
        const details = await detailsRes.json();
        console.log('Order details:', details);
        
        const updatedItems = selectedOrder.items.map((item, index) => ({
          ...item,
          backendDetailNid: details[index]?.nid,
        }));

        const updatedOrder = {
          ...selectedOrder,
          backendNid: createdOrder.nid,
          items: updatedItems,
        };
        setSelectedOrder(updatedOrder);
        setOriginalOrder(JSON.parse(JSON.stringify(updatedOrder)));
        setOrders((prev) =>
          prev.map((o) => (o.nid === selectedOrder.nid ? updatedOrder : o))
        );

        setOrderDirty(false);
        setSnackbar({
          open: true,
          message: 'Order created successfully!',
          type: 'success',
        });
      } else {
        // Order exists - we need to sync changes with backend

        // Handle deleted items - compare with original order
        if (originalOrder && originalOrder.backendNid) {
          const currentItemIds = selectedOrder.items
            .filter((item) => (item as any).backendDetailNid)
            .map((item) => (item as any).backendDetailNid);

          const deletedItems = originalOrder.items.filter(
            (item) =>
              (item as any).backendDetailNid &&
              !currentItemIds.includes((item as any).backendDetailNid)
          );

          for (const item of deletedItems) {
            const deleteRes = await fetch(`/api/orders/${selectedOrder.backendNid}/details/${(item as any).backendDetailNid}`, { method: 'DELETE' });
            if (!deleteRes.ok) throw new Error('Failed to delete order item');
          }
        }

        // Handle items with modified quantities
        const modifiedQuantityItems = selectedOrder.items.filter(
          (item) =>
            (item as any).backendDetailNid && (item as any).quantityModified
        );

        for (const item of modifiedQuantityItems) {
          const updateRes = await fetch(`/api/orders/${selectedOrder.backendNid}/details/${(item as any).backendDetailNid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantity }),
          });
          if (!updateRes.ok) throw new Error('Failed to update quantity');
          delete (item as any).quantityModified;
        }

        // Handle items with modified addons
        const modifiedAddonItems = selectedOrder.items.filter(
          (item) =>
            (item as any).backendDetailNid && (item as any).addonsModified
        );

        for (const item of modifiedAddonItems) {
          const addons = (item.menuItem.addonGroups || []).flatMap((group) => {
            const selectedOptionId = item.selectedOptions?.[group.nid];
            if (!selectedOptionId) return [];
            const option = group.options.find((opt) => opt.nid === selectedOptionId);
            if (!option) return [];
            return [{ ingredientId: option.nid, priceWoVat: option.price }];
          });

          const addonsRes = await fetch(`/api/orders/${selectedOrder.backendNid}/details/${(item as any).backendDetailNid}/addons`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addons),
          });
          if (!addonsRes.ok) throw new Error('Failed to update addons');
          delete (item as any).addonsModified;
        }

        // Find items that don't have a backendDetailNid (newly added)
        const newItems = selectedOrder.items.filter(
          (item) => !(item as any).backendDetailNid
        );

        for (const item of newItems) {
          const basePrice = item.menuItem.price;
          let addonsPriceWoVat = 0;
          const addons = (item.menuItem.addonGroups || []).flatMap((group) => {
            const selectedOptionId = item.selectedOptions?.[group.nid];
            if (!selectedOptionId) return [];
            const option = group.options.find((opt) => opt.nid === selectedOptionId);
            if (!option) return [];
            addonsPriceWoVat += option.price;
            return [{ ingredientId: option.nid, priceWoVat: option.price }];
          });

          const itemPriceWoVat = (basePrice + addonsPriceWoVat) * item.quantity;
          const itemPriceWtVat = itemPriceWoVat * vatRate;

          const itemRequest: OrderDetailRequest = {
            itemId: item.menuItem.nid,
            priceWoVat: itemPriceWoVat,
            priceWtVat: itemPriceWtVat,
            quantity: item.quantity,
            addons: addons.length > 0 ? addons : undefined,
          };

          const addRes = await fetch(`/api/orders/${selectedOrder.backendNid}/details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemRequest),
          });
          if (!addRes.ok) throw new Error('Failed to add item to order');
          const createdDetail = await addRes.json();
          (item as any).backendDetailNid = createdDetail.nid;
        }

        const updatedOrder = { ...selectedOrder };
        setSelectedOrder(updatedOrder);
        setOriginalOrder(JSON.parse(JSON.stringify(updatedOrder)));
        setOrders((prev) =>
          prev.map((o) => (o.nid === selectedOrder.nid ? updatedOrder : o))
        );

        setOrderDirty(false);
        setSnackbar({
          open: true,
          message: 'Order updated successfully!',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Failed to save order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Full error:', error);
      setSnackbar({
        open: true,
        message: `Failed to save order: ${errorMessage}`,
        type: 'error',
      });
    }
  };

  const removeDishFromOrder = (nid: number) => {
    if (!selectedOrder) return;

    const updated = selectedOrder.items.filter((it) => it.nid !== nid);
    setSelectedOrder({ ...selectedOrder, items: updated });
    setOrderDirty(true);

    setSnackbar({
      open: true,
      message: 'Dish removed from order.',
      type: 'info',
    });
  };

  const openDetails = (item: OrderDish) => {
    setModalItem(item);
    setModalSelections(item.selectedOptions ? { ...item.selectedOptions } : {});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
    setModalSelections({});
  };

  const toggleSelectOption = (groupId: number, optionId: number) => {
    setModalSelections((prev) => {
      if (prev[groupId] === optionId) {
        const updated = { ...prev };
        delete updated[groupId];
        return updated;
      }

      return { ...prev, [groupId]: optionId };
    });
  };

  const saveModal = () => {
    if (!selectedOrder || !modalItem) return;

    const updatedItems = selectedOrder.items.map((it) =>
      it.nid === modalItem.nid
        ? { ...it, selectedOptions: { ...modalSelections } }
        : it
    );

    // If the item has a backendDetailNid, mark it as modified for backend update
    if ((modalItem as any).backendDetailNid) {
      const itemToUpdate = updatedItems.find((it) => it.nid === modalItem.nid);
      if (itemToUpdate) {
        (itemToUpdate as any).addonsModified = true;
      }
    }

    setSelectedOrder({ ...selectedOrder, items: updatedItems });
    setOrderDirty(true);
    closeModal();
  };

  useEffect(() => {
    const anyState = (location as any).state;
    if (anyState && anyState.addedDish) {
      // Create a unique key using the dish's unique nid from DishSelection
      const stateKey = `${anyState.orderId}-${anyState.addedDish.nid}`;

      // Check both in-memory ref AND sessionStorage for processed states
      const processedStates = JSON.parse(
        sessionStorage.getItem('processedDishStates') || '[]'
      );

      if (
        processedStateRef.current === stateKey ||
        processedStates.includes(stateKey)
      ) {
        return;
      }

      // Mark as processed in both memory and sessionStorage
      processedStateRef.current = stateKey;
      processedStates.push(stateKey);
      sessionStorage.setItem(
        'processedDishStates',
        JSON.stringify(processedStates)
      );

      const payload = anyState.addedDish as {
        nid: number;
        menuItem: MenuItem;
        quantity: number;
        selectedOptions?: Record<number, number>;
      };

      const newItem: OrderDish = {
        nid: payload.nid, // Use the nid from payload, not Date.now()
        menuItem: payload.menuItem,
        quantity: payload.quantity,
        selectedOptions: payload.selectedOptions || {},
      };

      const targetOrderId = anyState.orderId;

      if (targetOrderId) {
        setOrders((prevOrders) => {
          const orderExists = prevOrders.some((o) => o.nid === targetOrderId);

          if (!orderExists) {
            // Order doesn't exist (stale navigation state), ignore silently
            console.warn(
              'Ignoring stale navigation state for non-existent order:',
              targetOrderId
            );
            return prevOrders;
          }

          const updatedOrders = prevOrders.map((order) => {
            if (order.nid === targetOrderId) {
              const updatedOrder = {
                ...order,
                items: [...order.items, newItem],
              };
              pendingOrderRef.current = updatedOrder; // Store in ref
              return updatedOrder;
            }
            return order;
          });

          return updatedOrders;
        });

        // Use the ref to set selected order
        const orderToSelect = pendingOrderRef.current;
        if (orderToSelect) {
          setSelectedOrder(orderToSelect);
          setOrderDirty(true);
          setSnackbar({
            open: true,
            message: 'Dish added to order. Click Save to save changes.',
            type: 'success',
          });
          pendingOrderRef.current = null; // Clear the ref
        }
      }

      // Don't clear navigation state - it causes context to reset
      // The processedStateRef + sessionStorage prevents duplicate processing
    }
  }, [location.state, navigate, location.pathname, setOrders]);

  const totalPrice = selectedOrder
    ? selectedOrder.items.reduce((sum, it) => {
        const base = it.menuItem.price * it.quantity;
        const optionsTotal = (it.menuItem.addonGroups || []).reduce(
          (optSum, group) => {
            const selId = it.selectedOptions
              ? it.selectedOptions[group.nid]
              : undefined;
            const sel = group.options.find((o) => o.nid === selId);
            return optSum + (sel ? sel.price * it.quantity : 0);
          },
          0
        );
        return sum + base + optionsTotal;
      }, 0)
    : 0;

  return (
    <div className="management">
      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', width: '100%' }}>
          Loading orders from database...
        </div>
      ) : (
        <>
          <div className="item-list-container">
            <div className="item-actions">
              <Button
                className="item-action-button new-item"
                onClick={handleNewOrder}
              >
                New Order
              </Button>

              <Button
                className={`item-action-button delete-item ${
                  cancelMode ? 'active' : ''
                }`}
                onClick={toggleCancelMode}
              >
                Cancel Orders
              </Button>
            </div>

            <h3 className="item-list-label">Order List</h3>

            <div className="item-list">
              {paginatedOrders.map((order) => (
                <div
                  key={order.backendNid || order.nid}
                  className={`item-card ${
                    selectedOrder?.nid === order.nid ? 'selected' : ''
                  }`}
                  onClick={() => handleOrderClick(order)}
                >
                  {order.backendNid
                    ? `Order #${order.backendNid}`
                    : 'New Order (unsaved)'}
                  {cancelMode && (
                    <span
                      className="delete-x"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelOrder(order.nid);
                      }}
                    >
                      ✖
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="item-list-pagination">
              <PaginationComponent
                count={Math.ceil(orders.length / itemsPerPage)}
                page={page}
                onChange={(_, value) => setPage(value)} // TODO: change _ back to e if event is needed
              />
            </div>
          </div>

          <div className="info-container">
            <h2 className="section-title">
              {' '}
              {selectedOrder
                ? selectedOrder.backendNid
                  ? `Order #${selectedOrder.backendNid} Information`
                  : 'New Order (unsaved) Information'
                : ''}
            </h2>

            {!selectedOrder ? (
              <p style={{ opacity: 0.5 }}>Select or create an order.</p>
            ) : (
              <>
                <div className="info-grid">
                  <div className="info-box">
                    <label>Current Total (€)</label>
                    <input type="text" value={totalPrice.toFixed(2)} readOnly />
                  </div>

                  <div className="info-box">
                    <label>Serving Staff</label>
                    <select
                      value={selectedOrder.staff}
                      onChange={(e) => updateStaff(e.target.value)}
                    >
                      <option value="">Select staff</option>
                      {staffList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <Button
                    className={`save-button ${orderDirty ? 'active' : ''}`}
                    disabled={!orderDirty}
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                  
                  {selectedOrder.backendNid && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => navigate(`/payment/${selectedOrder.backendNid}`)}
                    >
                      Process Payment
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="option-container">
            {selectedOrder && (
              <>
                <Button
                  className="option-tree-button item-action-button new-item"
                  onClick={addDishToOrder}
                >
                  + Add Dish
                </Button>

                <h2 className="section-title">
                  Dishes in Order ({selectedOrder.items.length})
                </h2>

                <div className="option-tree-list">
                  {selectedOrder.items
                    .slice(
                      (dishPage - 1) * dishesPerPage,
                      dishPage * dishesPerPage
                    )
                    .map((it) => {
                      // Calculate addons price
                      const addonsPrice = (
                        it.menuItem.addonGroups || []
                      ).reduce((sum, group) => {
                        const selectedOptionId =
                          it.selectedOptions?.[group.nid];
                        const selectedOption = group.options.find(
                          (opt) => opt.nid === selectedOptionId
                        );
                        return sum + (selectedOption?.price || 0);
                      }, 0);

                      const itemTotal =
                        (it.menuItem.price + addonsPrice) * it.quantity;

                      return (
                        <div key={it.nid} className="option-tree-box">
                          <div className="option-row">
                            <span className="fixed-name">
                              {it.menuItem.name}
                            </span>

                            <Button
                              className="details-button"
                              onClick={() => openDetails(it)}
                            >
                              Details
                            </Button>

                            <div className="quantity-box">
                              <button
                                onClick={() => updateQuantity(it.nid, -1)}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={it.quantity}
                                onChange={(e) =>
                                  setSelectedOrder((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          items: prev.items.map((item) =>
                                            item.nid === it.nid
                                              ? {
                                                  ...item,
                                                  quantity: Math.max(
                                                    1,
                                                    parseInt(e.target.value) ||
                                                      1
                                                  ),
                                                }
                                              : item
                                          ),
                                        }
                                      : prev
                                  )
                                }
                                min="1"
                              />
                              <button
                                onClick={() => updateQuantity(it.nid, +1)}
                              >
                                +
                              </button>
                            </div>

                            <input
                              type="text"
                              value={`€ ${itemTotal.toFixed(2)}`}
                              readOnly
                              style={{
                                width: 100,
                                flexShrink: 0,
                                fontWeight: 600,
                              }}
                              title="Total (with addons)"
                            />

                            <span
                              className="delete-dish"
                              onClick={() => removeDishFromOrder(it.nid)}
                            >
                              ✖
                            </span>
                          </div>

                          {it.selectedOptions &&
                            Object.keys(it.selectedOptions).length > 0 && (
                              <div
                                style={{
                                  marginTop: 8,
                                  color: '#cfcfcf',
                                  fontSize: '0.9rem',
                                }}
                              >
                                <div>
                                  Base Price: {it.menuItem.price.toFixed(2)} €
                                </div>
                                {it.menuItem.addonGroups?.map((group) => {
                                  const sel = it.selectedOptions
                                    ? it.selectedOptions[group.nid]
                                    : undefined;
                                  const selOpt = group.options.find(
                                    (o) => o.nid === sel
                                  );
                                  return selOpt ? (
                                    <div key={group.nid}>
                                      {group.name}: {selOpt.name}{' '}
                                      {selOpt.price
                                        ? ` - ${selOpt.price.toFixed(2)} €`
                                        : ''}
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            )}
                        </div>
                      );
                    })}
                </div>
              </>
            )}
            <div className="option-tree-pagination">
              <PaginationComponent
                count={Math.ceil(
                  (selectedOrder?.items.length || 0) / dishesPerPage
                )}
                page={dishPage}
                onChange={(_, value) => setDishPage(value)} // TODO: change _ back to e if event is needed
              />
            </div>
          </div>

          {modalOpen && modalItem && (
            <div className="modal-overlay" onClick={closeModal}>
              <div
                className="modal-content option-tree-box"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="option-tree-header" style={{ marginBottom: 8 }}>
                  <input value={modalItem.menuItem.name} readOnly />
                  <button
                    className="delete-tree modal-close"
                    onClick={closeModal}
                  >
                    ✖
                  </button>
                </div>

                <div className="option-list">
                  {(modalItem.menuItem.addonGroups || []).map((group) => (
                    <div
                      key={group.nid}
                      className="option-tree-box"
                      style={{ padding: 10 }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        {group.name}
                      </div>
                      <div className="option-list" style={{ gap: 6 }}>
                        {group.options.map((opt) => {
                          const selected =
                            modalSelections[group.nid] === opt.nid;
                          return (
                            <label
                              key={opt.nid}
                              className="option-row"
                              style={{ alignItems: 'center' }}
                            >
                              <input
                                type="radio"
                                name={`group-${group.nid}`}
                                checked={selected}
                                onChange={() =>
                                  toggleSelectOption(group.nid, opt.nid)
                                }
                              />
                              <input type="text" value={opt.name} readOnly />
                              <input
                                type="text"
                                value={`€ ${opt.price.toFixed(2)}`}
                                readOnly
                                style={{ width: 90, textAlign: 'right' }}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  <Button
                    className="item-action-button delete-item cancel-button"
                    onClick={() => {
                      setModalSelections({});
                      closeModal();
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="item-action-button new-item save-button-modal"
                    onClick={saveModal}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {confirmDeleteOpen && orderToDelete && (
            <div className="modal-overlay" onClick={cancelDelete}>
              <div
                className="modal-content option-tree-box"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 400 }}
              >
                <div
                  className="option-tree-header"
                  style={{ marginBottom: 16 }}
                >
                  <h3 style={{ margin: 0 }}>Confirm Delete</h3>
                  <button
                    className="delete-tree modal-close"
                    onClick={cancelDelete}
                  >
                    ✖
                  </button>
                </div>

                <p style={{ marginBottom: 24, fontSize: '1rem' }}>
                  Are you sure you want to delete{' '}
                  {orderToDelete.backendNid
                    ? `Order #${orderToDelete.backendNid}`
                    : 'this unsaved order'}
                  ?
                  {orderToDelete.backendNid && ' This action cannot be undone.'}
                </p>

                <div className="modal-actions">
                  <Button
                    className="item-action-button new-item"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={confirmDelete}
                    sx={{
                      backgroundColor: '#d32f2f',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': { backgroundColor: '#bb2929ff' },
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          <SnackbarNotification
            open={snackbar.open}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            message={snackbar.message}
            type={snackbar.type}
          />
        </>
      )}
    </div>
  );
}
