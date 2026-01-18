// src/components/trade/KLineChart.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { KlineData } from '@/lib/types';

// 定义组件接收的属性
interface KLineChartProps {
  pair: string; // 例如: "BTC/USDT"
}

// Binance API 返回的 K 线数据结构
type BinanceKline = [
  number, // Kline open time
  string, // Open price
  string, // High price
  string, // Low price
  string, // Close price
  string, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string, // Ignore
];

export function KLineChart({ pair }: KLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const [isChartReady, setIsChartReady] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);

  // 使用 ResizeObserver 来监听容器大小变化
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && container.clientWidth > 0 && container.clientHeight > 0) {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
        
        // 更新图表大小
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    console.log('KLineChart: pair changed to', pair);
    
    const container = chartContainerRef.current;
    if (!container || !pair) {
      console.log('KLineChart: container or pair missing', { container: !!container, pair });
      return;
    }

    // "BTC/USDT" -> "btcusdt"
    const symbol = pair.replace('/', '').toLowerCase();
    const binanceSymbol = pair.replace('/', '').toUpperCase();

    let initializationDone = false;
    let isMounted = true;
    let reconnectTimeoutId: NodeJS.Timeout | null = null;

    const initChart = async (attempt: number = 0): Promise<void> => {
      if (!isMounted) return;
      
      try {
        console.log(`KLineChart: initChart attempt ${attempt}`, {
          containerWidth: container.clientWidth,
          containerHeight: container.clientHeight
        });
        
        // 重置初始化状态
        initializationDone = false;
        setIsChartReady(false);
        
        // 等待容器有实际的尺寸
        let width = container.clientWidth;
        let height = container.clientHeight;
        
        if (width === 0 || height === 0) {
          if (attempt < 10) {
            console.log(`KLineChart: Container not ready (${attempt + 1}/10), retrying in 100ms`);
            await new Promise(resolve => setTimeout(resolve, 100));
            return initChart(attempt + 1);
          } else {
            // 强制使用一个合理的默认大小
            width = 800;
            height = 400;
            console.warn('KLineChart: Container size could not be determined after retries, using defaults');
            // 可能容器正在渲染中
            await new Promise(resolve => setTimeout(resolve, 200));
            width = Math.max(container.clientWidth, 800);
            height = Math.max(container.clientHeight, 400);
          }
        }

        // 移除旧图表
        if (chartRef.current) {
          console.log('KLineChart: removing old chart');
          try {
            // 显式调用 remove 方法来清理 DOM
            chartRef.current.remove();
          } catch (e) {
            console.error('Error removing old chart:', e);
          }
          chartRef.current = null;
        }
        
        // 清空容器
        container.innerHTML = '';

        // 1. 动态导入库
        console.log('KLineChart: importing lightweight-charts');
        const LightweightCharts = await import('lightweight-charts');
        const { createChart, CandlestickSeries } = LightweightCharts;

        if (!isMounted) return;

        // 2. 初始化图表
        console.log('KLineChart: creating chart instance', { width, height });
        chartRef.current = createChart(container, {
          layout: {
            background: { color: 'transparent' },
            textColor: '#DDD',
          },
          grid: {
            vertLines: { color: 'rgba(70, 130, 180, 0.5)' },
            horzLines: { color: 'rgba(70, 130, 180, 0.5)' },
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
          width: width,
          height: height,
        });

        // 3. 添加蜡烛图序列
        candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        // 4. 获取历史数据用于初始填充
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1m&limit=500`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: BinanceKline[] = await response.json();
          
          const formattedData = data.map((d) => ({
            time: Math.floor(d[0] / 1000) as any,
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
          }));

          candlestickSeriesRef.current?.setData(formattedData);
          chartRef.current?.timeScale().fitContent();
          initializationDone = true;
          setIsChartReady(true);
          console.log('KLineChart: initialized successfully for', pair);
        } catch (error) {
          console.error('KLineChart: Failed to fetch historical data:', error);
        }

        // 5. 连接 WebSocket 获取实时数据
        connectWebSocket();
      } catch (error) {
        console.error('KLineChart: Failed to initialize chart:', error);
      }
    };

    const connectWebSocket = () => {
      // 关闭旧连接
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      try {
        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@kline_1m`;
        console.log('Attempting to connect WebSocket:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log(`WebSocket connected for ${pair}`);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const kline = message.k;

            // 只在初始化完成后更新数据
            if (initializationDone && candlestickSeriesRef.current) {
              try {
                candlestickSeriesRef.current.update({
                  time: Math.floor(kline.t / 1000) as any,
                  open: parseFloat(kline.o),
                  high: parseFloat(kline.h),
                  low: parseFloat(kline.l),
                  close: parseFloat(kline.c),
                });
              } catch (e) {
                // 忽略图表更新错误
              }
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        wsRef.current.onerror = (event) => {
          console.warn(`WebSocket connection error for ${pair}`);
        };

        wsRef.current.onclose = (event) => {
          console.log(`WebSocket closed for ${pair}`, {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          
          // 尝试重新连接（在5秒后，仅当还在挂载状态时）
          if (!event.wasClean && isMounted) {
            console.log('Attempting to reconnect WebSocket in 5 seconds...');
            reconnectTimeoutId = setTimeout(() => {
              if (isMounted && wsRef.current) {
                connectWebSocket();
              }
            }, 5000);
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
      }
    };

    // 初始化图表和 WebSocket
    initChart();

    // 处理窗口大小调整
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // 清理函数：当组件卸载或 pair 改变时，断开连接
    return () => {
      isMounted = false;
      
      // 清理重连超时
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
      }
      
      try {
        window.removeEventListener('resize', handleResize);
      } catch (e) {
        // 忽略移除事件监听器的错误
      }
      
      // 关闭 WebSocket
      try {
        if (wsRef.current) {
          if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
            wsRef.current.close();
          }
          wsRef.current = null;
        }
      } catch (e) {
        // 忽略 WebSocket 关闭错误
      }

      // 移除图表 - lightweight-charts 需要显式移除
      try {
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      } catch (e) {
        console.warn('Error during chart removal:', e);
      }
      
      // 清空容器
      try {
        if (container && container.innerHTML) {
          container.innerHTML = '';
        }
      } catch (e) {
        console.warn('Error clearing container:', e);
      }
      
      candlestickSeriesRef.current = null;
    };
  }, [pair]); // 依赖项数组中加入 pair，每次 pair 变化时重新执行

  return (
    <div className="w-full h-full relative">
      <div 
        ref={chartContainerRef} 
        className="w-full h-full bg-slate-900"
      />
      {!isChartReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">
            <div className="text-sm">正在加载 K线图...</div>
            <div className="text-xs text-gray-400 mt-2">({pair})</div>
          </div>
        </div>
      )}
    </div>
  );
}