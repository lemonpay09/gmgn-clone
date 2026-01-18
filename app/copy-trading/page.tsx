// src/app/copy-trading/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { CopyTrader } from "@/lib/types";
import { CopyTraderCard } from "@/components/copy-trading/CopyTraderCard";

export default function CopyTradingPage() {
  const [traders, setTraders] = useState<CopyTrader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTraders = async () => {
      const response = await axios.get<CopyTrader[]>("/api/copy-traders");
      setTraders(response.data);
      setIsLoading(false);
    };
    fetchTraders();
  }, []);

  if (isLoading) return <div className="text-center p-8">加载交易员列表中...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">跟单交易</h1>
      <p className="text-muted-foreground mb-8">
        选择一位顶尖交易员，一键复制他们的交易策略。
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {traders.map((trader) => (
          <CopyTraderCard key={trader.id} trader={trader} />
        ))}
      </div>
    </div>
  );
}