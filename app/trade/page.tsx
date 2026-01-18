// src/app/trade/page.tsx
"use client";

// 从 React 导入 'useState' 和 'useEffect'
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { Order } from "@/lib/types";
import { toast } from "sonner";
export const dynamic = "force-dynamic";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KLineChart } from "@/components/trade/KLineChart";
import { TradePanel } from "@/components/trade/TradePanel";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

// `activePair`：当前选中的交易对
// `setActivePair`：点击新交易对时要调用的函数
function TokenSelectorPanel({
  activePair,
  setActivePair,
}: {
  activePair: string;
  setActivePair: (pair: string) => void;
}) {
  const pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ADA/USDT", "XRP/USDT", "DOGE/USDT"];

  return (
    <div className="p-4">
      <h3 className="font-bold mb-4">市场</h3>
      <ul>
        {pairs.map((pair) => (
          <li
            key={pair}
            onClick={() => setActivePair(pair)}
            className={`p-2 rounded-md cursor-pointer ${
              activePair === pair ? "font-semibold bg-muted" : "hover:bg-muted"
            }`}
          >
            {pair}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderBookPanel({ pair, price }: { pair: string; price: number | null }) {
  const { orders, updateOrderStatus } = useOrders();
  const { account, updateBalance, updateHoldings, addTradeHistory } = useAuth();

  // 模拟订单撮合逻辑
  useEffect(() => {
    if (!price || !account) return; // 如果没有实时价格或未登录，则不进行撮合

    const pendingLimitOrders = orders.filter(
      o => o.status === 'PENDING' && o.orderType === 'limit' && o.pair === pair
    );

    for (const order of pendingLimitOrders) {
      let shouldFill = false;
      
      // 如果是买单，且市场价 <= 挂单价，则成交
      if (order.side === 'buy' && price <= order.price) {
        shouldFill = true;
      }
      // 如果是卖单，且市场价 >= 挂单价，则成交
      else if (order.side === 'sell' && price >= order.price) {
        shouldFill = true;
      }

      if (shouldFill) {
        // 处理账户更新
        const baseCurrency = order.pair.split('/')[0];
        const tradeCost = order.price * order.amount;

        if (order.side === 'buy') {
          if (account.balance >= tradeCost) {
            // 扣除余额
            const newBalance = account.balance - tradeCost;
            updateBalance(newBalance);
            
            // 增加持仓
            const currentHolding = account.holdings[baseCurrency] || 0;
            const newHoldings = {
              ...account.holdings,
              [baseCurrency]: currentHolding + order.amount,
            };
            updateHoldings(newHoldings);
            
            // 记录交易
            addTradeHistory({
              id: order.id,
              pair: order.pair,
              side: 'BUY',
              price: order.price,
              amount: order.amount,
              timestamp: order.timestamp,
            });

            updateOrderStatus(order.id, 'FILLED');
            toast.success(`买入订单 #${order.id.slice(-4)} 已成交!`);
          }
        } else {
          const currentHolding = account.holdings[baseCurrency] || 0;
          if (currentHolding >= order.amount) {
            // 增加余额
            const newBalance = account.balance + tradeCost;
            updateBalance(newBalance);
            
            // 减少持仓
            const newHoldings = {
              ...account.holdings,
              [baseCurrency]: currentHolding - order.amount,
            };
            updateHoldings(newHoldings);
            
            // 记录交易
            addTradeHistory({
              id: order.id,
              pair: order.pair,
              side: 'SELL',
              price: order.price,
              amount: order.amount,
              timestamp: order.timestamp,
            });

            updateOrderStatus(order.id, 'FILLED');
            toast.success(`卖出订单 #${order.id.slice(-4)} 已成交!`);
          }
        }
      }
    }
  }, [price, orders, updateOrderStatus, pair, account, updateBalance, updateHoldings, addTradeHistory]); // 依赖于价格、订单列表的变化

  const filteredOrders = orders.filter(o => o.pair === pair);
  const pendingOrders = filteredOrders.filter(o => o.status === 'PENDING');
  const filledOrders = filteredOrders.filter(o => o.status === 'FILLED');

  const OrderRow = ({ order }: { order: Order }) => (
    <div className="text-xs grid grid-cols-3 gap-2 py-1 border-b">
      <span className={order.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
        {order.price.toFixed(2)}
      </span>
      <span className="text-right">{order.amount.toFixed(4)}</span>
      <span className="text-right text-muted-foreground text-[10px]">
         {new Date(order.timestamp).toLocaleTimeString('zh-CN')}
      </span>
    </div>
  );

  return (
    <div className="p-2 h-full flex flex-col">
      <h3 className="font-bold text-center mb-2 text-sm">订单历史</h3>
      <Tabs defaultValue="pending" className="flex-grow flex flex-col">
        <TabsList className="w-full grid grid-cols-2 h-auto">
          <TabsTrigger value="pending" className="text-xs">当前挂单 ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="filled" className="text-xs">成交历史 ({filledOrders.length})</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-grow mt-2">
          <div className="px-2">
            <TabsContent value="pending" className="mt-0">
              {pendingOrders.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">暂无挂单</div>
              ) : (
                <>
                  <div className="text-xs grid grid-cols-3 gap-2 text-muted-foreground pb-2 sticky top-0 bg-background">
                    <span>价格</span><span className="text-right">数量</span><span className="text-right">时间</span>
                  </div>
                  {pendingOrders.map(order => <OrderRow key={order.id} order={order} />)}
                </>
              )}
            </TabsContent>
            <TabsContent value="filled" className="mt-0">
              {filledOrders.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">暂无成交</div>
              ) : (
                <>
                  <div className="text-xs grid grid-cols-3 gap-2 text-muted-foreground pb-2 sticky top-0 bg-background">
                    <span>价格</span><span className="text-right">数量</span><span className="text-right">时间</span>
                  </div>
                  {filledOrders.map(order => <OrderRow key={order.id} order={order} />)}
                </>
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

export default function TradePage() {
  const { isAuthenticated } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  
  // 状态变量
  const searchParams = useSearchParams();

  const [activePair, setActivePair] = useState("BTC/USDT");
  // 为每个币种单独保持价格状态，避免切换时混乱
  const [prices, setPrices] = useState<{ [key: string]: number | null }>({
    'BTC/USDT': null,
    'ETH/USDT': null,
    'SOL/USDT': null,
    'BNB/USDT': null,
    'ADA/USDT': null,
    'XRP/USDT': null,
    'DOGE/USDT': null,
  });

  // useEffect 用于管理价格的定时获取
  useEffect(() => {
    // 将 "BTC/USDT" 转换为 "BTCUSDT"
    const symbol = activePair.replace('/', '').toUpperCase();
    
    let priceInterval: NodeJS.Timeout | null = null;
    let isMounted = true;

    const fetchPrice = async () => {
      if (!isMounted) return;
      
      try {
        const response = await fetch(`/api/price?symbol=${symbol}`);
        
        if (!response.ok) {
          console.error('Failed to fetch price:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log(`Price updated for ${activePair}:`, data.price);
        
        if (isMounted) {
          setPrices(prev => ({
            ...prev,
            [activePair]: data.price
          }));
        }
      } catch (error) {
        console.error('Failed to fetch price data:', error);
      }
    };

    // 立即获取一次价格
    fetchPrice();
    
    // 每2秒更新一次价格
    priceInterval = setInterval(fetchPrice, 2000);

    // 清理函数：当 activePair 改变时，清空定时器
    return () => {
      isMounted = false;
      if (priceInterval) {
        clearInterval(priceInterval);
      }
    };
  }, [activePair]);

  // 根据 URL query 参数设置初始 activePair
  useEffect(() => {
    const symbolParam = searchParams.get('symbol');
    if (symbolParam) {
      // symbolParam 例如 BTCUSDT -> 转换为 BTC/USDT
      const p = symbolParam.replace('USDT', '/USDT');
      setActivePair(p);
    }
  }, [searchParams]);

  // 注意：页面总体可见，但 K 线图与交易功能在未登录状态下会被禁用/提示登录

  const currentPrice = prices[activePair];

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex flex-grow border-t h-[calc(100vh-57px)]">
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={15} minSize={10}>
            <TokenSelectorPanel activePair={activePair} setActivePair={setActivePair} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize={70} className="h-full">
                {isAuthenticated ? (
                  <KLineChart pair={activePair} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="font-semibold">K 线图需要登录查看</h3>
                      <p className="text-sm text-muted-foreground mb-4">请登录以查看实时 K 线图与交易功能。</p>
                      <Button onClick={() => setIsAuthDialogOpen(true)}>登录查看</Button>
                    </div>
                  </div>
                )}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} className="h-full">
                <div className="p-4 h-full overflow-auto">
                  <TradePanel pair={activePair} price={currentPrice} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={15}>
            <OrderBookPanel pair={activePair} price={currentPrice} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col h-[calc(100vh-56px)]">
        <Tabs defaultValue="chart" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="market">市场</TabsTrigger>
            <TabsTrigger value="chart">图表</TabsTrigger>
            <TabsTrigger value="orders">订单</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="flex-grow overflow-auto">
            <TokenSelectorPanel activePair={activePair} setActivePair={setActivePair} />
          </TabsContent>

          <TabsContent value="chart" className="flex-grow flex flex-col">
            <div className="h-[300px] border-b">
              {isAuthenticated ? <KLineChart pair={activePair} /> : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-semibold">K 线图需要登录查看</h3>
                    <p className="text-sm text-muted-foreground mb-4">请登录以查看实时 K 线图与交易功能。</p>
                    <Button onClick={() => setIsAuthDialogOpen(true)}>登录查看</Button>
                  </div>
                </div>
              )}
            </div>
            <ScrollArea className="flex-grow">
              <div className="p-2">
                <TradePanel pair={activePair} price={currentPrice} />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="orders" className="flex-grow overflow-auto">
            <OrderBookPanel pair={activePair} price={currentPrice} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}