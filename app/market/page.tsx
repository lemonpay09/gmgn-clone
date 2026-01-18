import { MarketTable } from "@/components/market/MarketTable";

export default function MarketPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">市场行情</h1>
      <p className="text-muted-foreground mb-8">探索加密货币市场，发现下一个交易机会。</p>
      <div className="border rounded-lg">
        <MarketTable />
      </div>
    </div>
  );
}
