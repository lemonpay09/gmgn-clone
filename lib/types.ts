// src/lib/types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface WalletAsset {
  id: string; // 例如: 'bitcoin'
  symbol: string; // 例如: 'BTC'
  name: string;
  amount: number;
  valueUSD: number;
  imageUrl: string;
}

export interface TradeHistory {
  id: string;
  pair: string; // 例如: 'BTC/USDT'
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
  timestamp: string;
}

export interface CopyTrader {
  id: string;
  name:string;
  avatarUrl: string;
  roi: number; // 投资回报率 (百分比)
  followers: number;
  winRate: number; // 胜率 (百分比)
}

export interface KlineData {
  time: number; // Unix 时间戳
  open: number;
  high: number;
  low: number;
  close: number;
}