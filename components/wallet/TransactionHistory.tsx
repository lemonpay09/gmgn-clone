// src/components/wallet/TransactionHistory.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { TradeHistory as TradeHistoryType } from "@/lib/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TransactionHistory() {
  const { account, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<TradeHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!isAuthenticated || !account) {
      setIsLoading(false);
      return;
    }

    try {
      // 从账户中获取交易历史
      setHistory(account.tradeHistory);
    } catch (err) {
      setError("无法加载交易记录");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [account, isAuthenticated]);

  if (isLoading) return <div>加载交易记录中...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>交易记录</CardTitle>
          <p className="text-sm text-muted-foreground pt-2">请登录查看交易记录</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>交易记录</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">暂无交易记录</p>
        ) : (
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
                  <TableCell className="text-right">${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">{trade.amount.toFixed(4)}</TableCell>
                  <TableCell className="text-right">
                    {new Date(trade.timestamp).toLocaleString('zh-CN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}