"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
};

export type WaiterOrder = {
  orderId: string;
  tableNumber: string;
  items: OrderItem[];
  status: "Pending" | "Cooked" | "Served" | "Cancelled";
  timestamp: Date;
};

export type Bill = {
  billId: string;
  tableNumber: string;
  orders: WaiterOrder[];
  totalAmount: number;
  status: "Unpaid" | "Paid";
  timestamp: Date;
};

interface POSContextType {
  orders: WaiterOrder[];
  orderHistory: WaiterOrder[];
  bills: Bill[];
  placeOrder: (tableNumber: string, items: OrderItem[]) => void;
  markAsCooked: (orderId: string) => void;
  markAsServed: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  generateBill: (tableNumber: string) => number;
  payBill: (billId: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<WaiterOrder[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  const placeOrder = (tableNumber: string, items: OrderItem[]) => {
    const newOrder: WaiterOrder = {
      orderId: `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      tableNumber,
      items,
      status: "Pending",
      timestamp: new Date(),
    };
    setOrders((prev) => [...prev, newOrder]);
  };

  const markAsCooked = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, status: "Cooked" } : order
      )
    );
  };

  const markAsServed = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, status: "Served" } : order
      )
    );
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => {
      const orderToCancel = prev.find(o => o.orderId === orderId);
      if (orderToCancel) {
        setOrderHistory((hist) => [...hist, { ...orderToCancel, status: "Cancelled" }]);
      }
      return prev.filter((order) => order.orderId !== orderId);
    });
  };

  const generateBill = (tableNumber: string): number => {
    const tableOrders = orders.filter((o) => o.tableNumber === tableNumber);
    let total = 0;
    tableOrders.forEach((order) => {
      order.items.forEach((item) => {
        total += item.price;
      });
    });
    
    if (tableOrders.length > 0) {
      const newBill: Bill = {
        billId: `BILL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        tableNumber,
        orders: tableOrders,
        totalAmount: total,
        status: "Unpaid",
        timestamp: new Date(),
      };
      setBills((prev) => [...prev, newBill]);
      
      // Move to history
      setOrderHistory((prev) => [...prev, ...tableOrders]);
    }

    // Clear the active orders for this table
    setOrders((prev) => prev.filter((o) => o.tableNumber !== tableNumber));
    return total;
  };

  const payBill = (billId: string) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.billId === billId ? { ...bill, status: "Paid" } : bill
      )
    );
  };

  return (
    <POSContext.Provider value={{ 
      orders, 
      orderHistory, 
      bills, 
      placeOrder, 
      markAsCooked,
      markAsServed, 
      cancelOrder, 
      generateBill, 
      payBill 
    }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
}
