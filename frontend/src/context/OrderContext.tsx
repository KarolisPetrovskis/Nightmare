import React, { createContext, useState, useContext, useEffect, type ReactNode } from "react";

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
};

type Order = {
    nid: number;
    items: OrderDish[];
    staff: string;
    status?: number; // Order status from backend
    backendNid?: number; // Track backend order ID
};

type OrderContextType = {
    orders: Order[];
    setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);
/*
// Sample dishes for initial orders
const sampleDishes = {
    carbonara: {
        nid: 1,
        name: "Spaghetti Carbonara",
        price: 12.50,
        vatId: 1,
        addonGroups: [
            {
                nid: 101,
                name: "Choose Pasta Size",
                options: [
                    { nid: 1001, name: "Regular", price: 0 },
                    { nid: 1002, name: "Large", price: 2.00 }
                ]
            }
        ]
    },
    caesar: {
        nid: 2,
        name: "Caesar Salad",
        price: 8.90,
        vatId: 1,
        addonGroups: [
            {
                nid: 201,
                name: "Add Protein",
                options: [
                    { nid: 2001, name: "Chicken", price: 2.00 },
                    { nid: 2002, name: "Shrimp", price: 3.50 }
                ]
            }
        ]
    },
    pizza: {
        nid: 3,
        name: "Margherita Pizza",
        price: 10.00,
        vatId: 1,
        addonGroups: [
            {
                nid: 301,
                name: "Choose Crust",
                options: [
                    { nid: 3001, name: "Thin Crust", price: 0 },
                    { nid: 3002, name: "Thick Crust", price: 1.00 }
                ]
            }
        ]
    }
};

// Initial sample orders
const initialOrders: Order[] = [
    {
        nid: 1000,
        staff: "Alice",
        items: [
            {
                nid: 1,
                menuItem: sampleDishes.carbonara,
                quantity: 2,
                selectedOptions: { 101: 1001 }
            },
            {
                nid: 2,
                menuItem: sampleDishes.caesar,
                quantity: 1,
                selectedOptions: { 201: 2001 }
            }
        ]
    },
    {
        nid: 1001,
        staff: "Bob",
        items: [
            {
                nid: 3,
                menuItem: sampleDishes.pizza,
                quantity: 3,
                selectedOptions: { 301: 3002 }
            },
            {
                nid: 4,
                menuItem: sampleDishes.caesar,
                quantity: 2,
                selectedOptions: {}
            }
        ]
    },
    {
        nid: 1002,
        staff: "",
        items: [
            {
                nid: 5,
                menuItem: sampleDishes.carbonara,
                quantity: 1,
                selectedOptions: { 101: 1002 }
            }
        ]
    }
];*/

export function OrderProvider({ children }: { children: ReactNode }) {
    // Initialize from sessionStorage if available (only unsaved orders)
    const [orders, setOrdersState] = useState<Order[]>(() => {
        const saved = sessionStorage.getItem('unsavedOrders');
        return saved ? JSON.parse(saved) : [];
    });

    // Wrap setOrders to also save ONLY unsaved orders to sessionStorage
    const setOrders = (value: Order[] | ((prev: Order[]) => Order[])) => {
        setOrdersState(prev => {
            const newOrders = typeof value === 'function' ? value(prev) : value;
            
            // Only persist orders that don't have a backendNid (unsaved orders)
            const unsavedOrders = newOrders.filter(order => !order.backendNid);
            
            if (unsavedOrders.length > 0) {
                sessionStorage.setItem('unsavedOrders', JSON.stringify(unsavedOrders));
            } else {
                sessionStorage.removeItem('unsavedOrders');
            }
            
            return newOrders;
        });
    };

    return (
        <OrderContext.Provider value={{ orders, setOrders }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrderContext() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrderContext must be used within OrderProvider");
    }
    return context;
}
