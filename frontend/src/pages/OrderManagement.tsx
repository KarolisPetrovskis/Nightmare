import "./OrderManagement.css";
import "./Management.css";
import Button from "@mui/material/Button";
import { useState } from "react";
import dishesData from "./dishesData.json";

type Dish = {
    id: number;
    name: string;
    price: number;
};

type OrderDish = {
    id: number;
    dish: Dish;
    quantity: number;
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


    const totalPrice = selectedOrder
        ? selectedOrder.items.reduce(
            (sum, it) => sum + it.dish.price * it.quantity,
            0
        )
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
                    {orders.map((order) => (
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
                            {selectedOrder.items.map((it) => (
                                <div key={it.id} className="option-tree-box">
                                    <div className="option-row">
                                        <span>{it.dish.name}</span>
                                        <input type="text" value={`€ ${it.dish.price.toFixed(2)}`} readOnly />

                                        <Button className="details-button">Details</Button>

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
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
