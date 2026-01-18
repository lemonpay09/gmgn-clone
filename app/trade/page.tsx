// src/app/trade/page.tsx
"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { KLineChart } from "@/components/trade/KLineChart";
import { TradePanel } from "@/components/trade/TradePanel";

// 模拟的交易对和订单簿组件
function TokenSelectorPanel() {
  return (
    <div className="p-4">
      <h3 className="font-bold mb-4">市场</h3>
      <ul>
        <li className="p-2 rounded-md hover:bg-muted cursor-pointer font-semibold bg-muted">BTC/USDT</li>
        <li className="p-2 rounded-md hover:bg-muted cursor-pointer">ETH/USDT</li>
        <li className="p-2 rounded-md hover:bg-muted cursor-pointer">SOL/USDT</li>
      </ul>
    </div>
  );
}

function OrderBookPanel() {
  return (
    <div className="p-4">
      <h3 className="font-bold mb-4">订单簿</h3>
      {/* 这里可以放静态的订单数据 */}
      <div className="text-sm text-muted-foreground">订单簿功能待开发</div>
    </div>
  );
}

export default function TradePage() {
  return (
    // 我们需要设置一个高度，让可拖拽面板正常工作
    <div className="h-[calc(100vh-3.5rem)] border-t"> 
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={15} minSize={10}>
          <TokenSelectorPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="flex-grow">
              <KLineChart />
            </div>
            <div className="p-4">
              <TradePanel />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={15}>
          <OrderBookPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}