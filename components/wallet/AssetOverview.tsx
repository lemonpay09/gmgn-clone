// src/components/wallet/AssetOverview.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePrices } from "@/context/PriceContext";
import { WalletAsset } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// 币种信息
const COIN_INFO: { [symbol: string]: { name: string; imageUrl: string } } = {
  'BTC': { name: 'Bitcoin', imageUrl: '/tokens/btc.png' },
  'ETH': { name: 'Ethereum', imageUrl: '/tokens/eth.png' },
  'SOL': { name: 'Solana', imageUrl: '/tokens/sol.png' },
  'USDT': { name: 'Tether', imageUrl: '/tokens/usdt.png' },
  'XRP': { name: 'Ripple', imageUrl: '/tokens/xrp.png' },
  'ADA': { name: 'Cardano', imageUrl: '/tokens/ada.png' },
  'BNB': { name: 'Binance Coin', imageUrl: '/tokens/bnb.png' },
  'DOGE': { name: 'Dogecoin', imageUrl: '/tokens/doge.png' },
};

export function AssetOverview() {
  const { account, isAuthenticated } = useAuth();
  const { prices } = usePrices();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!isAuthenticated || !account) {
      setIsLoading(false);
      setAssets([]);
      return;
    }

    try {
      // 根据账户数据构建资产列表
      const assetsList: WalletAsset[] = [];

      // 添加 USDT 余额（初始1000w或交易后的余额）
      assetsList.push({
        id: 'usdt',
        symbol: 'USDT',
        name: 'Tether',
        amount: account.balance,
        valueUSD: account.balance,
        imageUrl: '/tokens/usdt.png',
      });

      // 添加其他持仓（支持实时浮动价格）
      const holdings = account.holdings || {};
      Object.entries(holdings).forEach(([symbol, amount]) => {
        if (typeof amount === 'number' && amount > 0) {
          // 获取实时价格，如果没有则使用默认价格
          const price = prices[symbol] || 0;
          const valueUSD = amount * price;
          assetsList.push({
            id: symbol.toLowerCase(),
            symbol,
            name: COIN_INFO[symbol]?.name || symbol,
            amount,
            valueUSD,
            imageUrl: COIN_INFO[symbol]?.imageUrl || '/tokens/usdt.png',
          });
          console.log(`Asset updated: ${symbol} = ${amount} @ ${price} = $${valueUSD}`);
        }
      });

      setAssets(assetsList);
      setLastUpdate(Date.now());
      console.log('Assets updated:', assetsList);
    } catch (err) {
      setError("无法加载资产数据");
      console.error('Asset loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [account, isAuthenticated, prices]); // 添加 prices 作为依赖，支持浮动更新

  if (isLoading) return <div>加载资产中...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>资产总览</CardTitle>
          <p className="text-sm text-muted-foreground pt-2">请登录查看资产</p>
        </CardHeader>
      </Card>
    );
  }

  const totalValue = assets.reduce((sum, asset) => sum + asset.valueUSD, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>资产总览</CardTitle>
        <p className="text-2xl font-bold pt-2">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-muted-foreground">总资产估值 (USD)</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无资产</p>
          ) : (
            assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image src={asset.imageUrl} alt={asset.name} width={40} height={40} />
                  <div>
                    <p className="font-semibold">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-right">{asset.amount.toFixed(4)} {asset.symbol}</p>
                  <p className="text-sm text-muted-foreground text-right">
                    ${asset.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}