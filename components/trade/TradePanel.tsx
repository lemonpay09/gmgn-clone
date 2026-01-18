// src/components/trade/TradePanel.tsx
"use client";
import { useState, useMemo } from 'react';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface TradePanelProps {
  pair: string; // 交易对，例如: "BTC/USDT"
  price: number | null; // 接收从父组件传来的实时价格
}

// 定义模拟的点差 (百分比)
const SPREAD_CONFIG: { [key: string]: number } = {
  'BTC/USDT': 0.0002, // 0.02%
  'ETH/USDT': 0.0003, // 0.03%
  'SOL/USDT': 0.0005, // 0.05%
  'BNB/USDT': 0.00035,
  'ADA/USDT': 0.0008,
  'XRP/USDT': 0.0009,
  'DOGE/USDT': 0.001,
};

export function TradePanel({ pair, price: currentPrice }: TradePanelProps) {
  const { isAuthenticated, account, updateBalance, updateHoldings, addTradeHistory } = useAuth();
  const { addOrder } = useOrders();
  const [side, setSide] = useState('buy'); // 'buy' 或 'sell'
  const [orderType, setOrderType] = useState('market'); // 'market' (市价) 或 'limit' (限价)
  
  const [limitPrice, setLimitPrice] = useState(''); // 用于限价单的价格输入
  const [amount, setAmount] = useState(''); // 数量输入
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const baseCurrency = pair.split('/')[0];
  const quoteCurrency = pair.split('/')[1];

  // 计算带有模拟点差的市价
  const marketPrice = useMemo(() => {
    if (!currentPrice) return null;
    const spread = SPREAD_CONFIG[pair] || 0.0004;
    if (side === 'buy') {
      return currentPrice * (1 + spread); // 买入价略高
    } else {
      return currentPrice * (1 - spread); // 卖出价略低
    }
  }, [currentPrice, side, pair]);

  const handleSubmit = async () => {
    // 检查登录状态
    if (!isAuthenticated || !account) {
      toast.error("请先登录账户");
      return;
    }

    // 验证输入
    setFormError('');
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('请输入有效的数量');
      toast.error("请输入有效的数量");
      return;
    }

    const finalPrice = orderType === 'market' ? marketPrice : parseFloat(limitPrice);
    
    if (orderType === 'limit') {
      if (!limitPrice || parseFloat(limitPrice) <= 0) {
        toast.error("请输入有效的限价价格");
        return;
      }
    } else {
      if (!finalPrice) {
        toast.error("无法获取市价，请稍后重试");
        return;
      }
    }

    // 检查余额/持仓
    const parsedAmount = parseFloat(amount);
    if (!finalPrice) {
      toast.error("无法获取市价，请稍后重试");
      return;
    }
    const tradeCost = finalPrice * parsedAmount;

    // 显性确认：当买入金额超过 50000 USDT 时要求二次确认
    if (side === 'buy' && tradeCost > 50000) {
      const confirmed = window.confirm(
        `您即将发起金额 ${tradeCost.toLocaleString()} USDT 的高额买入，是否确认下单？\n\n数量: ${parsedAmount} ${baseCurrency}\n价格: $${finalPrice.toFixed(2)}`
      );
      if (!confirmed) return;
    }

    if (side === 'buy') {
      if (account.balance < tradeCost) {
        toast.error(`余额不足。需要 $${tradeCost.toFixed(2)} USDT，当前余额 $${account.balance.toFixed(2)} USDT`);
        return;
      }
    } else {
      const currentHolding = account.holdings[baseCurrency] || 0;
      if (currentHolding < parsedAmount) {
        toast.error(`${baseCurrency} 持仓不足。需要 ${parsedAmount.toFixed(4)}, 当前持仓 ${currentHolding.toFixed(4)}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      setFormError('');
      const orderDetails = {
        pair,
        side: side as 'buy' | 'sell',
        orderType: orderType as 'market' | 'limit',
        price: finalPrice!,
        amount: parsedAmount,
        timestamp: new Date().toISOString()
      };
      
      // 如果是市价单，立即执行交易
      if (orderType === 'market') {
        if (side === 'buy') {
          // 扣除余额
          const newBalance = account.balance - tradeCost;
          updateBalance(newBalance);
          
          // 增加持仓
          const currentHolding = account.holdings[baseCurrency] || 0;
          const newHoldings = {
            ...account.holdings,
            [baseCurrency]: currentHolding + parsedAmount,
          };
          console.log(`Buy trade: adding ${parsedAmount} ${baseCurrency}, total: ${currentHolding + parsedAmount}`);
          console.log('New holdings:', newHoldings);
          updateHoldings(newHoldings);
        } else {
          // 卖出：增加余额，减少持仓
          const newBalance = account.balance + tradeCost;
          updateBalance(newBalance);
          
          const currentHolding = account.holdings[baseCurrency] || 0;
          const newHoldings = {
            ...account.holdings,
            [baseCurrency]: currentHolding - parsedAmount,
          };
          console.log(`Sell trade: removing ${parsedAmount} ${baseCurrency}, total: ${currentHolding - parsedAmount}`);
          console.log('New holdings:', newHoldings);
          updateHoldings(newHoldings);
        }
        
        // 添加交易历史
        addTradeHistory({
          id: `trade-${Date.now()}`,
          pair,
          side: side === 'buy' ? 'BUY' : 'SELL',
          price: finalPrice,
          amount: parsedAmount,
          timestamp: new Date().toISOString(),
        });
      }
      
      // 调用 addOrder 函数添加订单到全局状态
      addOrder(orderDetails, () => {});
      
      // 模拟网络延迟
      await new Promise(res => setTimeout(res, 300));

      toast.success(
        `${orderType === 'market' ? '市价' : '限价'} ${side === 'buy' ? '买入' : '卖出'} 订单已提交`,
        {
          description: `数量: ${amount} ${baseCurrency}, 价格: $${finalPrice?.toFixed(2) || 'N/A'}`
        }
      );
      // 成功后刷新或更新账户数据已在上面执行（updateBalance/updateHoldings/addTradeHistory）
      // 清理表单错误
      setFormError('');
      setLimitPrice('');
      setAmount('');

    } catch (error: any) {
      console.error('Order submission error:', error);
      const msg = (error && error.message) ? error.message : '下单失败，请稍后再试';
      setFormError(msg);
      toast.error('下单失败：' + msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 border rounded-md bg-muted/50 text-center space-y-3">
        <p className="text-sm font-medium">请先登录账户</p>
        <p className="text-xs text-muted-foreground">登录后即可进行交易</p>
      </div>
    );
  }

  return (
    <Tabs value={side} onValueChange={setSide} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="buy">买入</TabsTrigger>
        <TabsTrigger value="sell">卖出</TabsTrigger>
      </TabsList>
      <div className="p-4 space-y-4 border rounded-b-md">
        {/* 风险提示横幅 */}
        <div className="p-3 rounded bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          风险提示：本系统为模拟交易环境，请谨慎操作。
        </div>
        {/* 市价/限价切换开关 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">订单类型</span>
          <div className="flex items-center space-x-2">
            <Label 
              htmlFor="order-type-switch" 
              className={orderType === 'limit' ? 'text-muted-foreground' : 'font-semibold'}
            >
              市价
            </Label>
            <Switch
              id="order-type-switch"
              checked={orderType === 'limit'}
              onCheckedChange={(checked) => setOrderType(checked ? 'limit' : 'market')}
            />
            <Label 
              htmlFor="order-type-switch" 
              className={orderType === 'market' ? 'text-muted-foreground' : 'font-semibold'}
            >
              限价
            </Label>
          </div>
        </div>
        
        {/* 价格输入框，根据订单类型动态变化 */}
        <div className="space-y-2">
          <Label htmlFor="price">价格 ({quoteCurrency})</Label>
          {orderType === 'market' ? (
            // 市价模式：显示实时价格
            <div className="flex items-center justify-between p-2 border rounded bg-muted">
              <span className="text-sm">
                {marketPrice ? `≈ ${marketPrice.toFixed(2)}` : '获取中...'}
              </span>
              <span className="text-xs text-muted-foreground">实时市价</span>
            </div>
          ) : (
            // 限价模式：输入框可编辑
            <Input 
              id="price" 
              type="number"
              placeholder="请输入价格"
              value={limitPrice}
              onChange={e => setLimitPrice(e.target.value)}
              step="0.01"
            />
          )}
        </div>
        
        {/* 数量输入框 */}
        <div className="space-y-2">
          <Label htmlFor="amount">数量 ({baseCurrency})</Label>
          <Input 
            id="amount" 
            type="number" 
            placeholder="0.00" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            step="0.0001"
          />

          {formError && (
            <p className="text-sm text-destructive mt-2">{formError}</p>
          )}

          {side === 'sell' && (
            <div className="flex gap-2 mt-2">
              {[0.25, 0.5, 0.75, 1].map(p => (
                <Button key={p} variant="outline" size="sm" onClick={() => {
                  const currentHolding = account?.holdings[baseCurrency] || 0;
                  const val = (currentHolding * p);
                  setAmount(val.toFixed(4));
                }}>{Math.round(p * 100)}%</Button>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading} 
          className="w-full" 
          variant={side === 'buy' ? 'default' : 'destructive'}
        >
          {isLoading ? '提交中...' : `${side === 'buy' ? '买入' : '卖出'} ${baseCurrency}`}
        </Button>
      </div>
    </Tabs>
  );
}