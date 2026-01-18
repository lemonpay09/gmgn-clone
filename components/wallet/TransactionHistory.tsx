// src/components/wallet/TransactionHistory.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { TradeHistory as TradeHistoryType } from "@/lib/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TransactionHistory() {
  const [history, setHistory] = useState<TradeHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get<TradeHistoryType[]>("/api/trade-history");
        setHistory(response.data);
      } catch (err) {
        setError("无法加载交易记录");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) return <div>加载交易记录中...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>交易记录</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>交易对</TableHead>
              <TableHead>方向</TableHead>
              <TableHead className="text-right">价格 (USD)</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">{trade.pair}</TableCell>
                <TableCell>
                  <Badge variant={trade.side === 'BUY' ? 'default' : 'destructive'}>
                    {trade.side === 'BUY' ? '买入' : '卖出'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${trade.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">{trade.amount}</TableCell>
                <TableCell className="text-right">
                  {new Date(trade.timestamp).toLocaleString('zh-CN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}