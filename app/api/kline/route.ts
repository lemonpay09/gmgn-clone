import { NextResponse } from "next/server";
import klineData from "@/data/kline.json";

export async function GET() {
  // 在真实应用中，你会根据查询参数（如交易对和时间间隔）来获取数据
  return NextResponse.json(klineData);
}