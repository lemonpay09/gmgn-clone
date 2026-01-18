import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol'); // 例如: 'BTCUSDT'

  if (!symbol) {
    return NextResponse.json(
      { error: '缺少 symbol 参数' },
      { status: 400 }
    );
  }

  try {
    // 从 Binance API 获取实时价格
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      symbol: data.symbol,
      price: parseFloat(data.price),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to fetch price from Binance:', error);
    return NextResponse.json(
      { error: '获取价格失败' },
      { status: 500 }
    );
  }
}
