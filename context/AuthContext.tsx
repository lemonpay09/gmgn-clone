// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { User, UserAccount } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  account: UserAccount | null;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  updateHoldings: (holdings: { [symbol: string]: number }) => void;
  addTradeHistory: (trade: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const accountRef = useRef<UserAccount | null>(null);
  const userRef = useRef<User | null>(null);

  // 确保每次打开页面/启动应用都要重新登录 —— 清理残留的 `user` 键
  useEffect(() => {
    try {
      localStorage.removeItem("user");
    } catch (e) {
      // 忽略
    }
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    userRef.current = userData;
    
    // 检查是否存在账户，如果不存在则创建新账户
    const existingAccount = localStorage.getItem(`account_${userData.id}`);
    let userAccount: UserAccount;
    
    if (existingAccount) {
      userAccount = JSON.parse(existingAccount);
    } else {
      // 创建新账户，初始余额为1000w USDT
      userAccount = {
        userId: userData.id,
        balance: 100000000, // 初始1000w美金
        holdings: {}, // 初始没有任何持仓
        tradeHistory: [], // 初始交易历史为空
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    setAccount(userAccount);
    accountRef.current = userAccount;
    
    // 持久化到 localStorage
    localStorage.setItem(`account_${userData.id}`, JSON.stringify(userAccount));
  };

  const logout = () => {
    // 注：登出不删除 `account_{userId}`，以保留用户的历史操作数据。
    try {
      localStorage.removeItem("user");
    } catch (e) {}

    setUser(null);
    setAccount(null);
    userRef.current = null;
    accountRef.current = null;
  };

  const updateBalance = useCallback((newBalance: number) => {
    if (accountRef.current) {
      const updatedAccount = {
        ...accountRef.current,
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      };
      setAccount(updatedAccount);
      accountRef.current = updatedAccount;
      if (userRef.current) {
        localStorage.setItem(`account_${userRef.current.id}`, JSON.stringify(updatedAccount));
      }
      console.log('Balance updated:', newBalance);
    }
  }, []);

  const updateHoldings = useCallback((holdings: { [symbol: string]: number }) => {
    if (accountRef.current) {
      const updatedAccount = {
        ...accountRef.current,
        holdings,
        updatedAt: new Date().toISOString(),
      };
      setAccount(updatedAccount);
      accountRef.current = updatedAccount;
      if (userRef.current) {
        localStorage.setItem(`account_${userRef.current.id}`, JSON.stringify(updatedAccount));
      }
      console.log('Holdings updated:', holdings);
    }
  }, []);

  const addTradeHistory = useCallback((trade: any) => {
    if (accountRef.current) {
      const updatedAccount = {
        ...accountRef.current,
        tradeHistory: [...accountRef.current.tradeHistory, trade],
        updatedAt: new Date().toISOString(),
      };
      setAccount(updatedAccount);
      accountRef.current = updatedAccount;
      if (userRef.current) {
        localStorage.setItem(`account_${userRef.current.id}`, JSON.stringify(updatedAccount));
      }
      console.log('Trade history updated');
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, account, isAuthenticated, login, logout, updateBalance, updateHoldings, addTradeHistory }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}