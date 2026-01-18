// src/app/api/trade/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const orderDetails = await request.json();

  // 模拟处理订单
  console.log("Received new order:", orderDetails);

  // 模拟延迟
  await new Promise(res => setTimeout(res, 1000));

  // 总是返回成功
  return NextResponse.json({
    success: true,
    message: "订单已提交",
    order: orderDetails,
  });
}