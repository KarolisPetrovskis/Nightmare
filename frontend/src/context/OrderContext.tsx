import React, { createContext, useState, useContext, ReactNode } from "react";

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

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);

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
