// src/components/copy-trading/CopyTraderCard.tsx
"use client";

import { useState } from "react";
import { CopyTrader } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CopyTraderCardProps {
  trader: CopyTrader;
}

export function CopyTraderCard({ trader }: CopyTraderCardProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const handleCopy = () => {
    if (!amount || +amount <= 0) {
      toast.error("请输入有效的跟单金额");
      return;
    }
    // 模拟 API 请求
    console.log(`Copying trader ${trader.name} with amount ${amount}`);
    toast.success(`成功跟单 ${trader.name}`, {
      description: `跟单金额: $${amount}`,
    });
    setOpen(false); // 关闭弹窗
    setAmount(""); // 重置金额
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={trader.avatarUrl} alt={trader.name} />
          <AvatarFallback>{trader.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{trader.name}</CardTitle>
          <CardDescription>胜率: {trader.winRate}%</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-500">{trader.roi}%</p>
          <p className="text-sm text-muted-foreground">投资回报率 (ROI)</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{trader.followers}</p>
          <p className="text-sm text-muted-foreground">跟随者</p>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">跟单</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>跟单 {trader.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  金额 (USD)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                  placeholder="例如: 100"
                />
              </div>
            </div>
            <Button onClick={handleCopy}>确认跟单</Button>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}