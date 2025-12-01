import "./OrderManagement.css";
import "../Management.css";
import Button from "@mui/material/Button";
import { useState } from "react";
import dishesData from "../dishesData.json";
import Pagination from '@mui/material/Pagination';

type Option = {
    id: number;
    name: string;
    price: number;
};

type OptionTree = {
    id: number;
    name: string;
    options: Option[];
};

type Dish = {
    id: number;
    name: string;
    price: number;
    optionTrees?: OptionTree[]; // <-- include option trees
};

type OrderDish = {
    id: number;
    dish: Dish;
    quantity: number;
    selectedOptions?: Record<number, number>; // treeId -> optionId
};

type Order = {
    id: number;
    items: OrderDish[];
    staff: string;
};

export default function OrderManagement() {
    const [dishes] = useState<Dish[]>(dishesData.dishes);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderDirty, setOrderDirty] = useState(false);
    const [cancelMode, setCancelMode] = useState(false);

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalItem, setModalItem] = useState<OrderDish | null>(null);
    const [modalSelections, setModalSelections] = useState<Record<number, number>>({});

    const [page, setPage] = useState(1);
    const itemsPerPage = 7;

    const [dishPage, setDishPage] = useState(1);
    const dishesPerPage = 6; // adjust as needed


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
    };

    const updateStaff = (staff: string) => {
        if (!selectedOrder) return;
        setSelectedOrder({ ...selectedOrder, staff });
        setOrderDirty(true);
    };

    const addDishToOrder = () => {
        if (!selectedOrder) return;

        const firstDish = dishes[0];
        if (!firstDish) return;

        const newItem: OrderDish = {
            id: Date.now(),
            dish: firstDish,
            quantity: 1,
            selectedOptions: {},
        };

        setSelectedOrder({
            ...selectedOrder,
            items: [...selectedOrder.items, newItem],
        });

        setOrderDirty(true);
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
    };

    const removeDishFromOrder = (id: number) => {
        if (!selectedOrder) return;

        const updated = selectedOrder.items.filter(it => it.id !== id);
        setSelectedOrder({ ...selectedOrder, items: updated });
        setOrderDirty(true);
    };

    // open details modal for an order item
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

    const toggleSelectOption = (treeId: number, optionId: number) => {
        setModalSelections(prev => {
            // if already selected → unselect it
            if (prev[treeId] === optionId) {
                const updated = { ...prev };
                delete updated[treeId];
                return updated;
            }

            // otherwise select normally
            return { ...prev, [treeId]: optionId };
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

    const totalPrice = selectedOrder
        ? selectedOrder.items.reduce((sum, it) => {
            const base = it.dish.price * it.quantity;
            // treat missing optionTrees as empty array to avoid "possibly undefined"
            const optionsTotal = (it.dish.optionTrees || []).reduce((optSum, tree) => {
                const selId = it.selectedOptions ? it.selectedOptions[tree.id] : undefined;
                const sel = tree.options.find((o) => o.id === selId);
                return optSum + (sel ? sel.price * it.quantity : 0);
            }, 0);
            return sum + base + optionsTotal;
        }, 0)
        : 0;

    return (
        <div className="management">
            {/* ITEM LIST */}
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
                        Cancel Order
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
                    <Pagination
                        count={Math.ceil(orders.length / itemsPerPage)}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        variant="outlined"
                        color="secondary"
                        className="dish-pagination"
                    />
                </div>
            </div>

            {/* INFORMATION CONTAINER */}
            <div className="info-container">
                <h2 className="section-title" >Order Information</h2>

                {!selectedOrder ? (
                    <p style={{ opacity: 0.5 }}>Select or create an order.</p>
                ) : (
                    <>
                        <div className="info-grid">
                            {/* TOTAL */}
                            <div className="info-box">
                                <label>Current Total (€)</label>
                                <input type="text" value={totalPrice.toFixed(2)} readOnly />
                            </div>

                            {/* STAFF */}
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

            {/* DISHES IN ORDER */}
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
                                            <span>{it.dish.name}</span>
                                            <input type="text" value={`€ ${it.dish.price.toFixed(2)}`} readOnly />

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

                                        {/* show small summary of selected options */}
                                        {it.selectedOptions && Object.keys(it.selectedOptions).length > 0 && (
                                            <div style={{ marginTop: 8, color: '#cfcfcf', fontSize: '0.9rem' }}>
                                                {it.dish.optionTrees?.map(tree => {
                                                    const sel = it.selectedOptions ? it.selectedOptions[tree.id] : undefined;
                                                    const selOpt = tree.options.find(o => o.id === sel);
                                                    return selOpt ? <div key={tree.id}>{tree.name}: {selOpt.name}</div> : null;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </>
                )}
                <div className="option-tree-pagination">
                    <Pagination
                        count={Math.ceil((selectedOrder?.items.length || 0) / dishesPerPage)}
                        page={dishPage}
                        onChange={(e, value) => setDishPage(value)}
                        variant="outlined"
                        color="secondary"
                        className='dish-pagination'
                    />
                </div>

            </div>


            {/* Modal */}
            {modalOpen && modalItem && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content option-tree-box" onClick={(e) => e.stopPropagation()}>
                        <div className="option-tree-header" style={{ marginBottom: 8 }}>
                            <input value={modalItem.dish.name} readOnly />
                            <button className="delete-tree modal-close" onClick={closeModal}>✖</button>
                        </div>

                        <div className="option-list">
                            {(modalItem.dish.optionTrees || []).map((tree) => (
                                <div key={tree.id} className="option-tree-box" style={{ padding: 10 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{tree.name}</div>
                                    <div className="option-list" style={{ gap: 6 }}>
                                        {tree.options.map(opt => {
                                            const selected = modalSelections[tree.id] === opt.id;
                                            return (
                                                <label key={opt.id} className="option-row" style={{ alignItems: 'center' }}>
                                                    <input
                                                        type="radio"
                                                        name={`tree-${tree.id}`}
                                                        checked={selected}
                                                        onChange={() => toggleSelectOption(tree.id, opt.id)}
                                                    />
                                                    <span style={{ marginLeft: 8 }}>{opt.name}</span>
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

        </div>
    );
}
