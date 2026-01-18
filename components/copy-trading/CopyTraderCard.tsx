// src/components/copy-trading/CopyTraderCard.tsx
"use client";

import { useState } from "react";
import { CopyTrader } from "@/lib/types";
import { useCopyTrading } from "@/context/CopyTradingContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CopyTraderCardProps {
  trader: CopyTrader;
}

export function CopyTraderCard({ trader }: CopyTraderCardProps) {
  const { startFollowing, stopFollowing, isFollowing } = useCopyTrading();
  const currentlyFollowing = isFollowing(trader.id);

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const handleCopy = () => {
    if (!amount || +amount <= 0) {
      return;
    }
    startFollowing(trader, +amount);
    setOpen(false);
    setAmount("");
  };

  const handleStopFollowing = () => {
    stopFollowing(trader.id);
  };

  return (
    <Card className={currentlyFollowing ? "border-primary" : ""}>
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
        {currentlyFollowing ? (
          <Button variant="outline" className="w-full" onClick={handleStopFollowing}>
            停止跟单
          </Button>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">跟单</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>跟单 {trader.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">输入您希望用于跟随该交易员的金额。</p>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">金额 (USD)</Label>
                  <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="例如: 100" />
                </div>
              </div>
              <Button onClick={handleCopy}>确认跟单</Button>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}