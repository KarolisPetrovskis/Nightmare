import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../Management.css';
import '../OrderManagement.css';
import './DishSelection.css';
import Button from '@mui/material/Button';
import PaginationComponent from '../../../components/Pagination/PaginationComponent';
import { menuApi } from '../../../services/menuService';
import {
  menuAddonsApi,
  addonGroupsApi,
} from '../../../services/menuAddonsService';

const BUSINESS_ID = 1; // TODO: Get from auth context

type Option = { nid: number; name: string; price: number };
type OptionGroup = { nid: number; name: string; options: Option[] };
type MenuItem = {
  nid: number;
  name: string;
  price: number;
  discount?: number | null;
  vatId: number;
  addonGroups?: OptionGroup[];
};

type OrderDishPayload = {
  nid: number;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions?: Record<number, number>;
};

export default function DishSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allDishes, setAllDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the order ID from the navigation state
  const orderId = (location as any).state?.orderId;

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDish, setModalDish] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [modalSelections, setModalSelections] = useState<
    Record<number, number>
  >({});
  const [businessId, setBusinessId] = useState<number | null>(null);

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

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const id = await fetchBusinessId();
        setBusinessId(id);
        const items = await menuApi.getMenu(id, 0, 1000);

        // Fetch addon groups for each item
        const itemsWithAddons = await Promise.all(
          items.map(async (item: any) => {
            try {
              const groups = await addonGroupsApi.getGroupsByMenuItemNid(
                item.nid
              );

              // Fetch addons for each group
              const addonGroups = await Promise.all(
                groups.map(async (group: { nid: number; name: string }) => {
                  const addons = await menuAddonsApi.getAddonsByGroupNid(
                    group.nid
                  );
                  return {
                    nid: group.nid,
                    name: group.name,
                    options: addons.map(
                      (addon: {
                        nid: number;
                        name: string;
                        price?: number | null;
                      }) => {
                        if (addon.price === undefined || addon.price === null) {
                          console.warn('Addon missing price:', addon);
                        }
                        return {
                          nid: addon.nid,
                          name: addon.name,
                          price: addon.price || 0,
                        };
                      }
                    ),
                  };
                })
              );

              return {
                nid: item.nid,
                name: item.name,
                price: item.price,
                discount: item.discount,
                vatId: item.vatId,
                addonGroups,
              };
            } catch (error) {
              console.error(
                `Failed to fetch addon groups for item ${item.nid}:`,
                error
              );
              return {
                nid: item.nid,
                name: item.name,
                price: item.price,
                discount: item.discount,
                vatId: item.vatId,
                addonGroups: [],
              };
            }
          })
        );

        setAllDishes(itemsWithAddons);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const filtered = allDishes.filter((d) =>
    d.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const openDish = (dish: MenuItem) => {
    setModalDish(dish);
    setModalSelections({});
    setQuantity(1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalDish(null);
    setModalSelections({});
  };

  const toggleSelectOption = (groupId: number, optionId: number) => {
    setModalSelections((prev) => {
      if (prev[groupId] === optionId) {
        const copy = { ...prev };
        delete copy[groupId];
        return copy;
      }
      return { ...prev, [groupId]: optionId };
    });
  };

  const saveDish = (): OrderDishPayload | null => {
    if (!modalDish) return null;

    return {
      nid: Date.now(),
      menuItem: modalDish,
      quantity: Math.max(1, Math.floor(quantity)),
      selectedOptions: { ...modalSelections },
    };
  };

  const returnToOrder = (payload: OrderDishPayload) => {
    navigate('/order-management', { state: { addedDish: payload, orderId } });
  };

  const saveAndReturn = () => {
    const payload = saveDish();
    if (!payload) return;
    returnToOrder(payload);
  };

  if (loading) {
    return (
      <div className="management">
        <div style={{ padding: 20, textAlign: 'center' }}>
          Loading menu items...
        </div>
      </div>
    );
  }

  return (
    <div className="management">
      <div className="item-list-container" style={{ flexGrow: 1 }}>
        <div className="item-actions" style={{ alignItems: 'center' }}>
          <Button
            className="item-action-button new-item"
            onClick={() => navigate('/order-management')}
          >
            ← Back to Order
          </Button>

          <input
            className="search-input"
            placeholder="Search dishes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: 'none',
              background: '#1f1f1f',
              color: 'white',
              marginLeft: 12,
              flex: 1,
            }}
          />
        </div>

        <h3 className="item-list-label">Select dish</h3>

        <div className="dish-grid">
          {visible.map((d) => (
            <div
              key={d.nid}
              className="item-card dish-card"
              onClick={() => openDish(d)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontWeight: 700 }}>€ {d.price.toFixed(2)}</div>
              </div>
              <div
                style={{ marginTop: 8, color: '#bdbdbd', fontSize: '0.9rem' }}
              >
                {d.addonGroups && d.addonGroups.length > 0
                  ? `${d.addonGroups.length} option group(s)`
                  : 'No options'}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <PaginationComponent
            count={pageCount}
            page={page}
            onChange={(_, v) => setPage(v)}
          />
        </div>
      </div>

      {/* modal */}
      {modalOpen && modalDish && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content option-tree-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="option-tree-header" style={{ marginBottom: 8 }}>
              <input value={modalDish.name} readOnly />
              <button className="delete-tree modal-close" onClick={closeModal}>
                ✖
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600 }}>Quantity</div>
              <div className="quantity-box" style={{ alignItems: 'center' }}>
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min={1}
                />
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <div style={{ marginLeft: 'auto', fontWeight: 700 }}>
                € {(modalDish.price * quantity).toFixed(2)}
              </div>
            </div>

            <div className="option-list">
              {(modalDish.addonGroups || []).map((group) => (
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
                      const selected = modalSelections[group.nid] === opt.nid;
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
                          <input
                            type="text"
                            value={opt.name}
                            readOnly
                            style={{ flex: 1, minWidth: 0 }}
                          />
                          <input
                            type="text"
                            value={`€ ${opt.price.toFixed(2)}`}
                            readOnly
                            style={{
                              width: 90,
                              textAlign: 'right',
                              flexShrink: 0,
                            }}
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
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                className="item-action-button new-item"
                onClick={saveAndReturn}
              >
                Add to order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
