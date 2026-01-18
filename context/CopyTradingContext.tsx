"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Following, CopyTrader } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface CopyTradingContextType {
  followingList: Following[];
  startFollowing: (trader: CopyTrader, amount: number) => void;
  stopFollowing: (traderId: string) => void;
  isFollowing: (traderId: string) => boolean;
}

const CopyTradingContext = createContext<CopyTradingContextType | undefined>(undefined);

export function CopyTradingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [followingList, setFollowingList] = useState<Following[]>([]);

  // 从 localStorage 加载当前用户的跟单列表
  useEffect(() => {
    if (!user) {
      setFollowingList([]);
      return;
    }
    try {
      const raw = localStorage.getItem(`following_${user.id}`);
      if (raw) {
        setFollowingList(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to load following list:", e);
    }
  }, [user]);

  // 持久化当前用户的跟单列表
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(`following_${user.id}`, JSON.stringify(followingList));
    } catch (e) {
      console.error("Failed to save following list:", e);
    }
  }, [followingList, user]);

  const isFollowing = (traderId: string) => {
    return followingList.some(f => f.traderId === traderId);
  };

  const startFollowing = (trader: CopyTrader, amount: number) => {
    if (isFollowing(trader.id)) {
      toast.error(`您已经在跟单 ${trader.name}。`);
      return;
    }
    const newFollowing: Following = {
      traderId: trader.id,
      traderName: trader.name,
      amount: amount,
      startDate: new Date().toISOString(),
    };
    setFollowingList(prev => [...prev, newFollowing]);
    toast.success(`成功开始跟单 ${trader.name}`, {
        description: `跟单金额: $${amount}`,
    });
  };

  const stopFollowing = (traderId: string) => {
    setFollowingList(prev => prev.filter(f => f.traderId !== traderId));
    toast.info("已停止跟单。");
  };

  return (
    <CopyTradingContext.Provider value={{ followingList, startFollowing, stopFollowing, isFollowing }}>
      {children}
    </CopyTradingContext.Provider>
  );
}

export function useCopyTrading() {
  const context = useContext(CopyTradingContext);
  if (context === undefined) {
    throw new Error("useCopyTrading must be used within a CopyTradingProvider");
  }
  return context;
}
