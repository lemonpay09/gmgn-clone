// src/context/PriceContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";

interface PriceContextType {
  prices: { [symbol: string]: number }; // 例如 { BTC: 42000, ETH: 2500, SOL: 100 }
  updatePrice: (symbol: string, price: number) => void;
  getPrice: (symbol: string) => number | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

// 初始价格（备用）
const INITIAL_PRICES: { [symbol: string]: number } = {
  'BTC': 42000,
  'ETH': 2500,
  'SOL': 100,
  'BNB': 300,
  'ADA': 0.4,
  'XRP': 0.8,
  'DOGE': 0.14,
};

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<{ [symbol: string]: number }>(INITIAL_PRICES);
  const webSocketsRef = useRef<{ [key: string]: WebSocket }>({});

  const updatePrice = useCallback((symbol: string, price: number) => {
    setPrices(prevPrices => {
      // 只有当价格真的改变时才更新，避免不必要的重新渲染
      if (prevPrices[symbol] === price) {
        return prevPrices;
      }
      return {
        ...prevPrices,
        [symbol]: price
      };
    });
  }, []);

  const getPrice = useCallback((symbol: string): number | null => {
    return prices[symbol] || null;
  }, [prices]);

  // 为每个币种创建独立的 WebSocket 连接以获取实时价格
  useEffect(() => {
    const pairs = [
      { symbol: 'BTC', pair: 'btcusdt' },
      { symbol: 'ETH', pair: 'ethusdt' },
      { symbol: 'SOL', pair: 'solusdt' },
      { symbol: 'BNB', pair: 'bnbusdt' },
      { symbol: 'ADA', pair: 'adausdt' },
      { symbol: 'XRP', pair: 'xrpusdt' },
      { symbol: 'DOGE', pair: 'dogeusdt' },
    ];

    pairs.forEach(({ symbol, pair }) => {
      // 如果已经存在相同的连接，则跳过
      if (webSocketsRef.current[symbol]) {
        return;
      }

      try {
        const wsUrl = `wss://stream.binance.com:9443/ws/${pair}@trade`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`Price WebSocket connected for ${symbol}`);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.p);
            updatePrice(symbol, price);
          } catch (error) {
            console.error(`Failed to parse price for ${symbol}:`, error);
          }
        };

        ws.onerror = (error) => {
          console.warn(`WebSocket error for ${symbol}:`, error);
        };

        ws.onclose = () => {
          console.log(`WebSocket closed for ${symbol}`);
          delete webSocketsRef.current[symbol];
        };

        webSocketsRef.current[symbol] = ws;
      } catch (error) {
        console.error(`Failed to create WebSocket for ${symbol}:`, error);
      }
    });

    // 清理函数
    return () => {
      Object.entries(webSocketsRef.current).forEach(([symbol, ws]) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
      webSocketsRef.current = {};
    };
  }, [updatePrice]);

  return (
    <PriceContext.Provider value={{ prices, updatePrice, getPrice }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrices() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error("usePrices must be used within a PriceProvider");
  }
  return context;
}
