import "./OrderManagement.css";
import "../Management.css";
import Button from "@mui/material/Button";

import dishesData from "../dishesData.json";
import PaginationComponent from "../../components/Pagination/PaginationComponent";
import SnackbarNotification from "../../components/SnackBar/SnackNotification";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type Option = {
    id: number;
    name: string;
    price: number;
};

type OptionGroup = {
    id: number;
    name: string;
    options: Option[];
};

type MenuItem = {
    id: number;
    name: string;
    price: number;
    // keep other menu fields if present in dishesData (map will attach optionGroups below)
    optionGroups?: OptionGroup[];
};

type OrderDish = {
    id: number;
    menuItem: MenuItem;
    quantity: number;
    selectedOptions?: Record<number, number>;
};

type Order = {
    id: number;
    items: OrderDish[];
    staff: string;
};

export default function OrderManagement() {
    const [dishes] = useState<MenuItem[]>(
        dishesData.dishes.map(d => ({ ...d, optionGroups: d.optionTrees || [] }))
    );
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderDirty, setOrderDirty] = useState(false);
    const [cancelMode, setCancelMode] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalItem, setModalItem] = useState<OrderDish | null>(null);
    const [modalSelections, setModalSelections] = useState<Record<number, number>>({});

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
    const itemsPerPage = 7;

    const [dishPage, setDishPage] = useState(1);
    const dishesPerPage = 6;

    

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedOrders = orders.slice(start, end);

    const staffList = ["Alice", "Bob", "Charlie", "Diana"];

    const toggleCancelMode = () => {
        setCancelMode((prev) => !prev);
    };

    const handleNewOrder = () => {
        const emptyOrder: Order = {
            id: Date.now(),
            items: [],
            staff: "",
        };

        setOrders((prev) => [...prev, emptyOrder]);
        setSelectedOrder(emptyOrder);
        setOrderDirty(false);
    };

    const handleOrderClick = (order: Order) => {
        if (!cancelMode) {
            setSelectedOrder({ ...order });
            setOrderDirty(false);
        }
    };

    const handleCancelOrder = (orderId: number) => {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);

        setSnackbar({
            open: true,
            message: 'Order cancelled.',
            type: 'success',
        });
    };

    const updateStaff = (staff: string) => {
        if (!selectedOrder) return;
        setSelectedOrder({ ...selectedOrder, staff });
        setOrderDirty(true);
    };

    const addDishToOrder = () => {
        navigate("/order-management/select-dish");
    };

    const updateQuantity = (id: number, delta: number) => {
        if (!selectedOrder) return;

        const updated = selectedOrder.items
            .map((it) =>
                it.id === id
                    ? { ...it, quantity: Math.max(1, it.quantity + delta) }
                    : it
            );

        setSelectedOrder({ ...selectedOrder, items: updated });
        setOrderDirty(true);
    };

    const handleSave = () => {
        if (!selectedOrder) return;

        setOrders((prev) =>
            prev.map((o) => (o.id === selectedOrder.id ? selectedOrder : o))
        );

        setOrderDirty(false);
        setSnackbar({
            open: true,
            message: 'Order saved successfully!',
            type: 'success',
        });
    };

    const removeDishFromOrder = (id: number) => {
        if (!selectedOrder) return;

        const updated = selectedOrder.items.filter(it => it.id !== id);
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
        setModalSelections(prev => {
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

        const updatedItems = selectedOrder.items.map(it =>
            it.id === modalItem.id ? { ...it, selectedOptions: { ...modalSelections } } : it
        );

        setSelectedOrder({ ...selectedOrder, items: updatedItems });
        setOrderDirty(true);
        closeModal();
    };

    
    useEffect(() => {
        // read addedDish from navigation state
        const anyState = (location as any).state;
        if (anyState && anyState.addedDish) {
            const payload = anyState.addedDish as {
                id: number;
                menuItem: MenuItem;
                quantity: number;
                selectedOptions?: Record<number, number>;
            };

            // if there's no selected order, create one automatically
            if (!selectedOrder) {
                const newOrder: Order = { id: Date.now(), items: [], staff: "" };
                setOrders(prev => [...prev, newOrder]);
                setSelectedOrder(newOrder);
            }

            // add to currently selected order
            setSelectedOrder(prev => {
                if (!prev) return prev;
                const newItem = {
                    id: payload.id,
                    menuItem: payload.menuItem,
                    quantity: payload.quantity,
                    selectedOptions: payload.selectedOptions || {}
                };
                return { ...prev, items: [...prev.items, newItem] };
            });

            setOrderDirty(true);

            // clear the navigation state (replace with empty state so repeated back/refresh doesn't re-add)
            navigate(location.pathname, { replace: true, state: {} });
        }
        // only want to run when location changes
    }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalPrice = selectedOrder
        ? selectedOrder.items.reduce((sum, it) => {
            const base = it.menuItem.price * it.quantity;
            const optionsTotal = (it.menuItem.optionGroups || []).reduce((optSum, group) => {
                const selId = it.selectedOptions ? it.selectedOptions[group.id] : undefined;
                const sel = group.options.find((o) => o.id === selId);
                return optSum + (sel ? sel.price * it.quantity : 0);
            }, 0);
            return sum + base + optionsTotal;
        }, 0)
        : 0;

    return (
        <div className="management">
            <div className="item-list-container">
                <div className="item-actions">
                    <Button
                        className="item-action-button new-item"
                        onClick={handleNewOrder}
                    >
                        New Order
                    </Button>

                    <Button
                        className={`item-action-button delete-item ${cancelMode ? "active" : ""
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
                            key={order.id}
                            className={`item-card ${selectedOrder?.id === order.id ? "selected" : ""
                                }`}
                            onClick={() => handleOrderClick(order)}
                        >
                            Order #{order.id}
                            {cancelMode && (
                                <span
                                    className="delete-x"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelOrder(order.id);
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
                <h2 className="section-title" >Order Information</h2>

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

                        <Button
                            className={`save-button ${orderDirty ? "active" : ""}`}
                            disabled={!orderDirty}
                            onClick={handleSave}
                        >
                            Save
                        </Button>
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

                        <h2 className="section-title">Dishes in Order</h2>

                        <div className="option-tree-list">
                            {selectedOrder.items
                                .slice((dishPage - 1) * dishesPerPage, dishPage * dishesPerPage)
                                .map((it) => (
                                    <div key={it.id} className="option-tree-box">
                                        <div className="option-row">
                                            <span>{it.menuItem.name}</span>
                                            <input type="text" value={`€ ${it.menuItem.price.toFixed(2)}`} readOnly />

                                            <Button className="details-button" onClick={() => openDetails(it)}>Details</Button>

                                            <div className="quantity-box">
                                                <button onClick={() => updateQuantity(it.id, -1)}>−</button>
                                                <input
                                                    type="number"
                                                    value={it.quantity}
                                                    onChange={(e) => setSelectedOrder(prev => prev ? {
                                                        ...prev,
                                                        items: prev.items.map(item =>
                                                            item.id === it.id
                                                                ? { ...item, quantity: Math.max(1, parseInt(e.target.value) || 1) }
                                                                : item
                                                        )
                                                    } : prev)}
                                                    min="1"
                                                />
                                                <button onClick={() => updateQuantity(it.id, +1)}>+</button>
                                            </div>
                                            <span className="delete-dish" onClick={() => removeDishFromOrder(it.id)}>
                                                ✖
                                            </span>

                                        </div>

                                        {it.selectedOptions && Object.keys(it.selectedOptions).length > 0 && (
                                            <div style={{ marginTop: 8, color: '#cfcfcf', fontSize: '0.9rem' }}>
                                                {it.menuItem.optionGroups?.map(group => {
                                                    const sel = it.selectedOptions ? it.selectedOptions[group.id] : undefined;
                                                    const selOpt = group.options.find(o => o.id === sel);
                                                    return selOpt ? <div key={group.id}>{group.name}: {selOpt.name}</div> : null;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </>
                )}
                <div className="option-tree-pagination">
                    <PaginationComponent
                        count={Math.ceil((selectedOrder?.items.length || 0) / dishesPerPage)}
                        page={dishPage}
                        onChange={(_, value) => setDishPage(value)} // TODO: change _ back to e if event is needed
                    />
                </div>

            </div>

            {modalOpen && modalItem && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content option-tree-box" onClick={(e) => e.stopPropagation()}>
                        <div className="option-tree-header" style={{ marginBottom: 8 }}>
                            <input value={modalItem.menuItem.name} readOnly />
                            <button className="delete-tree modal-close" onClick={closeModal}>✖</button>
                        </div>

                        <div className="option-list">
                            {(modalItem.menuItem.optionGroups || []).map((group) => (
                                <div key={group.id} className="option-tree-box" style={{ padding: 10 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{group.name}</div>
                                    <div className="option-list" style={{ gap: 6 }}>
                                        {group.options.map(opt => {
                                            const selected = modalSelections[group.id] === opt.id;
                                            return (
                                                <label key={opt.id} className="option-row" style={{ alignItems: 'center' }}>
                                                    <input
                                                        type="radio"
                                                        name={`group-${group.id}`}
                                                        checked={selected}
                                                        onChange={() => toggleSelectOption(group.id, opt.id)}
                                                    />
                                                    <input type="text" value={opt.name} readOnly />
                                                    <input type="text" value={`€ ${opt.price.toFixed(2)}`} readOnly style={{ width: 90, textAlign: 'right' }} />
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

                            <Button className="item-action-button new-item save-button-modal" onClick={saveModal}>
                                Save
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
        </div>
    );
}