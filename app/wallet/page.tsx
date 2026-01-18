// src/app/wallet/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { AssetOverview } from "@/components/wallet/AssetOverview";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";

export default function WalletPage() {
  const { isAuthenticated, user } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  // 如果用户未登录，显示一个友好的提示和登录按钮
  if (!isAuthenticated) {
    return (
      <>
        <div className="container mx-auto p-4 md:p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">请先登录</h2>
          <p className="text-muted-foreground mb-6">
            您需要登录后才能查看您的钱包资产。
          </p>
          <Button onClick={() => setIsAuthDialogOpen(true)}>
            前往登录
          </Button>
        </div>
        <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      </>
    );
  }

  // 如果用户已登录，显示钱包内容
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">
        欢迎回来, {user?.name}!
      </h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AssetOverview />
        </div>
        <div className="lg:col-span-2">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}