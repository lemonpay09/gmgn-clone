// src/context/OrderContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Order, OrderStatus, TradeHistory } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status'>, accountUpdateFn: (updates: { balance: number, holdings: { [symbol: string]: number }, trade: TradeHistory }) => void) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user, account, addTradeHistory } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  // Load persisted orders for current user
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    try {
      const raw = localStorage.getItem(`orders_${user.id}`);
      if (raw) {
        const parsed: Order[] = JSON.parse(raw);
        setOrders(parsed);

        // Sync filled orders into account.tradeHistory if missing
        const existingTradeIds = (account?.tradeHistory || []).map(t => t.id);
        parsed.forEach(o => {
          if (o.status === 'FILLED' && !existingTradeIds.includes(o.id)) {
            const trade: TradeHistory = {
              id: o.id,
              pair: o.pair,
              side: o.side === 'buy' ? 'BUY' : 'SELL',
              price: o.price,
              amount: o.amount,
              timestamp: o.timestamp,
            };
            try {
              addTradeHistory(trade);
            } catch (e) {
              console.error('Failed to sync trade history from orders:', e);
            }
          }
        });
      }
    } catch (e) {
      console.error('Failed to load persisted orders:', e);
    }
  }, [user]);

  // Persist orders when they change
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist orders:', e);
    }
  }, [orders, user]);

  const addOrder = useCallback((newOrderData: Omit<Order, 'id' | 'status'>, accountUpdateFn: (updates: { balance: number, holdings: { [symbol: string]: number }, trade: TradeHistory }) => void) => {
    const newOrder: Order = {
      ...newOrderData,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: newOrderData.orderType === 'market' ? 'FILLED' : 'PENDING',
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);

    // 如果是市价单，立即处理账户更新（由调用方提供具体逻辑）
    if (newOrder.orderType === 'market') {
      processOrder(newOrder, accountUpdateFn);
    }
  }, []);

  const processOrder = (order: Order, accountUpdateFn: (updates: { balance: number, holdings: { [symbol: string]: number }, trade: TradeHistory }) => void) => {
    // 这个函数会从调用者那里获取账户信息和更新函数，避免在 Context 中依赖 AuthContext
    const baseCurrency = order.pair.split('/')[0];
    const tradeCost = order.price * order.amount;

    // 创建模拟的账户更新对象
    const updates = {
      balance: 0,
      holdings: {} as { [symbol: string]: number },
      trade: {
        id: order.id,
        pair: order.pair,
        side: order.side === 'buy' ? 'BUY' as const : 'SELL' as const,
        price: order.price,
        amount: order.amount,
        timestamp: order.timestamp,
      } as TradeHistory,
    };

    // 这个函数会在组件中计算实际的更新值
    accountUpdateFn(updates);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id ? { ...order, status } : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
