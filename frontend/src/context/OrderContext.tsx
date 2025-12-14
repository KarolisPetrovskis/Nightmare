import React, { createContext, useState, useContext, type ReactNode } from "react";

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

type OrderContextType = {
    orders: Order[];
    setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Sample dishes for initial orders
const sampleDishes = {
    carbonara: {
        id: 1,
        name: "Spaghetti Carbonara",
        price: 12.50,
        optionGroups: [
            {
                id: 101,
                name: "Choose Pasta Size",
                options: [
                    { id: 1001, name: "Regular", price: 0 },
                    { id: 1002, name: "Large", price: 2.00 }
                ]
            }
        ]
    },
    caesar: {
        id: 2,
        name: "Caesar Salad",
        price: 8.90,
        optionGroups: [
            {
                id: 201,
                name: "Add Protein",
                options: [
                    { id: 2001, name: "Chicken", price: 2.00 },
                    { id: 2002, name: "Shrimp", price: 3.50 }
                ]
            }
        ]
    },
    pizza: {
        id: 3,
        name: "Margherita Pizza",
        price: 10.00,
        optionGroups: [
            {
                id: 301,
                name: "Choose Crust",
                options: [
                    { id: 3001, name: "Thin Crust", price: 0 },
                    { id: 3002, name: "Thick Crust", price: 1.00 }
                ]
            }
        ]
    }
};

// Initial sample orders
const initialOrders: Order[] = [
    {
        id: 1000,
        staff: "Alice",
        items: [
            {
                id: 1,
                menuItem: sampleDishes.carbonara,
                quantity: 2,
                selectedOptions: { 101: 1001 }
            },
            {
                id: 2,
                menuItem: sampleDishes.caesar,
                quantity: 1,
                selectedOptions: { 201: 2001 }
            }
        ]
    },
    {
        id: 1001,
        staff: "Bob",
        items: [
            {
                id: 3,
                menuItem: sampleDishes.pizza,
                quantity: 3,
                selectedOptions: { 301: 3002 }
            },
            {
                id: 4,
                menuItem: sampleDishes.caesar,
                quantity: 2,
                selectedOptions: {}
            }
        ]
    },
    {
        id: 1002,
        staff: "",
        items: [
            {
                id: 5,
                menuItem: sampleDishes.carbonara,
                quantity: 1,
                selectedOptions: { 101: 1002 }
            }
        ]
    }
];

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);

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
