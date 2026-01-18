// src/components/trade/TradePanel.tsx
"use client";
import { useState } from 'react';
import axios from 'axios';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TradePanel() {
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!price || !amount) {
      toast.error("价格和数量不能为空");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('/api/trade', {
        pair: 'BTC/USDT',
        side,
        price: parseFloat(price),
        amount: parseFloat(amount),
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success(`市价${side === 'buy' ? '买入' : '卖出'}订单已提交`, {
          description: `数量: ${amount} BTC, 价格: $${price}`
        });
        setPrice('');
        setAmount('');
      }
    } catch (error) {
      toast.error("下单失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Tabs defaultValue="buy" className="w-full" onValueChange={(val) => setSide(val)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="buy">买入</TabsTrigger>
        <TabsTrigger value="sell">卖出</TabsTrigger>
      </TabsList>
      <div className="p-4 space-y-4 border rounded-b-md">
        <div className="space-y-2">
          <Label htmlFor="price">价格 (USDT)</Label>
          <Input id="price" type="number" placeholder="市价" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">数量 (BTC)</Label>
          <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full" variant={side === 'buy' ? 'default' : 'destructive'}>
          {isLoading ? '提交中...' : (side === 'buy' ? '买入 BTC' : '卖出 BTC')}
        </Button>
      </div>
    </Tabs>
  );
}