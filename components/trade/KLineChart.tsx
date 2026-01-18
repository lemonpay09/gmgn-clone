// src/components/trade/KLineChart.tsx
"use client";

import { useEffect, useRef } from 'react';
import axios from 'axios';
import { KlineData } from '@/lib/types';

export function KLineChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);

  useEffect(() => {
    // 使用一个立即执行的异步函数来处理动态导入
    const initChart = async () => {
      if (!chartContainerRef.current) return;

      try {
        // 1. 在 useEffect 内部动态导入库
        const LightweightCharts = await import('lightweight-charts');
        
        const createChart = LightweightCharts.createChart;
        const CandlestickSeries = LightweightCharts.CandlestickSeries;
        
        if (!createChart) {
          console.error('createChart 函数未找到');
          return;
        }

        // 2. 初始化图表
        const chart = createChart(chartContainerRef.current, {
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
          width: chartContainerRef.current?.clientWidth || 800,
          height: chartContainerRef.current?.clientHeight || 400,
        });

        chartRef.current = chart;

        // 3. 添加 K 线序列 - 使用 addSeries 方法
        const series = chart.addSeries(CandlestickSeries, {
          upColor: '#26a69a', 
          downColor: '#ef5350', 
          borderVisible: false,
          wickUpColor: '#26a69a', 
          wickDownColor: '#ef5350',
        });

        candlestickSeriesRef.current = series;

        // 4. 获取数据并设置到图表
        try {
          const response = await axios.get<KlineData[]>('/api/kline');
          series.setData(response.data);
          chart.timeScale().fitContent();
        } catch (err) {
          console.error('获取 K 线数据失败:', err);
        }
      } catch (err) {
        console.error('图表初始化失败:', err);
      }
    };

    // 延迟初始化，确保 DOM 已准备好
    const timeoutId = setTimeout(initChart, 100);

    // 处理窗口大小调整的逻辑
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []); // 依赖项数组为空，确保只运行一次

  return <div ref={chartContainerRef} className="w-full h-full" />;
}