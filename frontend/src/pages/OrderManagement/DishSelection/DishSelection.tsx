import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Management.css";
import "../OrderManagement.css"; // reuse your existing order styles for modal, item-card, etc.
import "./DishSelection.css"; // new styles for grid
import Button from "@mui/material/Button";
import dishesData from "../../dishesData.json";
import PaginationComponent from "../../../components/Pagination/PaginationComponent";

type Option = { id: number; name: string; price: number; };
type OptionGroup = { id: number; name: string; options: Option[]; };
type MenuItem = {
  id: number;
  name: string;
  price: number;
  discount?: number;
  discountExpiration?: string;
  vat?: string;
  optionTrees?: OptionGroup[];
  optionGroups?: OptionGroup[];
};

type OrderDishPayload = {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions?: Record<number, number>;
};

export default function DishSelectionPage() {
  const navigate = useNavigate();
  const allDishes: MenuItem[] = useMemo(() =>
    dishesData.dishes.map(d => ({ ...d, optionTrees: d.optionTrees || [] })), []
  );

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12; // e.g. 3 rows of 4
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDish, setModalDish] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [modalSelections, setModalSelections] = useState<Record<number, number>>({});

  const filtered = allDishes.filter(d =>
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
    setModalSelections(prev => {
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
    id: Date.now(),
    menuItem: {
      ...modalDish,
      // normalize field name so OrderManagement can read optionGroups
      optionGroups: (modalDish as any).optionGroups ?? modalDish.optionTrees ?? []
    },
    quantity: Math.max(1, Math.floor(quantity)),
    selectedOptions: { ...modalSelections }
  };
};

  const returnToOrder = (payload: OrderDishPayload) => {
    navigate("/order-management", { state: { addedDish: payload } });
  };

  const saveAndReturn = () => {
    const payload = saveDish();
    if (!payload) return;
    returnToOrder(payload);
  };


  return (
    <div className="management">
      <div className="item-list-container" style={{ flexGrow: 1 }}>
        <div className="item-actions" style={{ alignItems: "center" }}>
          <Button className="item-action-button new-item" onClick={() => navigate("/order-management")}>
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
              padding: "8px 10px",
              borderRadius: 6,
              border: "none",
              background: "#1f1f1f",
              color: "white",
              marginLeft: 12,
              flex: 1,
            }}
          />
        </div>

        <h3 className="item-list-label">Select dish</h3>

        <div className="dish-grid">
          {visible.map(d => (
            <div key={d.id} className="item-card dish-card" onClick={() => openDish(d)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontWeight: 700 }}>€ {d.price.toFixed(2)}</div>
              </div>
              <div style={{ marginTop: 8, color: "#bdbdbd", fontSize: "0.9rem" }}>
                {d.optionTrees && d.optionTrees.length > 0 ? `${d.optionTrees.length} option group(s)` : "No options"}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <PaginationComponent count={pageCount} page={page} onChange={(_, v) => setPage(v)} />
        </div>
      </div>

      {/* modal */}
      {modalOpen && modalDish && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content option-tree-box" onClick={(e) => e.stopPropagation()}>
            <div className="option-tree-header" style={{ marginBottom: 8 }}>
              <input value={modalDish.name} readOnly />
              <button className="delete-tree modal-close" onClick={closeModal}>✖</button>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>Quantity</div>
              <div className="quantity-box" style={{ alignItems: "center" }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                />
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <div style={{ marginLeft: "auto", fontWeight: 700 }}>€ {(modalDish.price * quantity).toFixed(2)}</div>
            </div>

            <div className="option-list">
              {(modalDish.optionTrees || []).map(group => (
                <div key={group.id} className="option-tree-box" style={{ padding: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{group.name}</div>
                  <div className="option-list" style={{ gap: 6 }}>
                    {group.options.map(opt => {
                      const selected = modalSelections[group.id] === opt.id;
                      return (
                        <label key={opt.id} className="option-row" style={{ alignItems: "center" }}>
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
              <Button className="item-action-button delete-item cancel-button" onClick={closeModal}>Cancel</Button>
              <Button className="item-action-button new-item" onClick={saveAndReturn}>Add to order</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
