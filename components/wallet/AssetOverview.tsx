// src/components/wallet/AssetOverview.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { WalletAsset } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export function AssetOverview() {
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get<WalletAsset[]>("/api/wallet");
        setAssets(response.data);
      } catch (err) {
        setError("无法加载资产数据");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  if (isLoading) return <div>加载资产中...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

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
          {assets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image src={asset.imageUrl} alt={asset.name} width={40} height={40} />
                <div>
                  <p className="font-semibold">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-right">{asset.amount} {asset.symbol}</p>
                <p className="text-sm text-muted-foreground text-right">
                  ${asset.valueUSD.toLocaleString('en-US')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}