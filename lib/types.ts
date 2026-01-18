// src/lib/types.ts
import { Time } from "lightweight-charts";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface UserAccount {
  userId: string;
  balance: number; // 账户余额（USDT），初始10w
  holdings: { [symbol: string]: number }; // 持仓信息，例如 { 'BTC': 0.5, 'ETH': 2 }
  tradeHistory: TradeHistory[];
  createdAt: string;
  updatedAt: string;
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
  time: Time; // Unix 时间戳
  open: number;
  high: number;
  low: number;
  close: number;
}

export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED';

export interface Order {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price: number;
  amount: number;
  status: OrderStatus;
  timestamp: string;
}

export interface Following {
  traderId: string;
  traderName: string;
  amount: number;
  startDate: string;
}

export interface MarketToken {
  symbol: string; // "BTCUSDT"
  priceChangePercent: string; // "1.23"
  lastPrice: string; // "70123.45"
  highPrice: string;
  lowPrice: string;
  volume: string; // 24h 成交量（币）
  quoteVolume: string; // 24h 成交额（USDT）
}