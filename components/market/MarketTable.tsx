"use client";

import { useState, useEffect, useRef } from "react";
import { MarketToken } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from 'next/navigation';

// 交易对列表
const SYMBOLS_TO_FETCH = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT"];

export function MarketTable() {
  const [tokens, setTokens] = useState<MarketToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMarketData = async () => {
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr', { signal: controller.signal });
        const allTokens: any[] = await response.json();

        const filteredTokens = allTokens
          .filter(token => SYMBOLS_TO_FETCH.includes(token.symbol))
          .map((t) => ({
            symbol: t.symbol,
            priceChangePercent: t.priceChangePercent,
            lastPrice: t.lastPrice,
            highPrice: t.highPrice,
            lowPrice: t.lowPrice,
            volume: t.volume,
            quoteVolume: t.quoteVolume,
          } as MarketToken));

        setTokens(filteredTokens);
        setLastUpdated(new Date());
      } catch (error) {
        if ((error as any).name === 'AbortError') return;
        console.error("Failed to fetch market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => {
      clearInterval(interval);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const handleRowClick = (symbol: string) => {
    // 跳转到交易页并传入 symbol 参数
    router.push(`/trade?symbol=${encodeURIComponent(symbol)}`);
  };

  if (isLoading) return <div className="text-center p-8">正在加载市场数据...</div>;
  return (
    <div>
      <div className="px-4 py-2 text-sm text-muted-foreground">{lastUpdated ? `上次更新: ${lastUpdated.toLocaleTimeString()}` : '正在获取数据...'}</div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>交易对</TableHead>
              <TableHead className="text-right">最新价格 (USDT)</TableHead>
              <TableHead className="text-right">24h 涨跌幅</TableHead>
              <TableHead className="text-right">24h 最高价</TableHead>
              <TableHead className="text-right">24h 最低价</TableHead>
              <TableHead className="text-right">24h 成交额</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => {
              const priceChange = parseFloat(token.priceChangePercent);
              const isPositive = priceChange >= 0;

              return (
                <TableRow key={token.symbol} onClick={() => handleRowClick(token.symbol)} className="cursor-pointer">
                  <TableCell className="font-medium">{token.symbol.replace('USDT', '/USDT')}</TableCell>
                  <TableCell className="text-right font-semibold">{parseFloat(token.lastPrice).toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">{parseFloat(token.highPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{parseFloat(token.lowPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(parseFloat(token.quoteVolume) / 1_000_000).toFixed(2)}M</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>交易对</TableHead>
          <TableHead className="text-right">最新价格 (USDT)</TableHead>
          <TableHead className="text-right">24h 涨跌幅</TableHead>
          <TableHead className="text-right">24h 最高价</TableHead>
          <TableHead className="text-right">24h 最低价</TableHead>
          <TableHead className="text-right">24h 成交额</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map((token) => {
          const priceChange = parseFloat(token.priceChangePercent);
          const isPositive = priceChange >= 0;

          return (
            <TableRow key={token.symbol} onClick={() => handleRowClick(token.symbol)} className="cursor-pointer">
              <TableCell className="font-medium">{token.symbol.replace('USDT', '/USDT')}</TableCell>
              <TableCell className="text-right font-semibold">{parseFloat(token.lastPrice).toFixed(2)}</TableCell>
              <TableCell className={`text-right font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">{parseFloat(token.highPrice).toFixed(2)}</TableCell>
              <TableCell className="text-right">{parseFloat(token.lowPrice).toFixed(2)}</TableCell>
              <TableCell className="text-right">${(parseFloat(token.quoteVolume) / 1_000_000).toFixed(2)}M</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
