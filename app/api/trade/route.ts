// src/app/api/trade/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const orderDetails = await request.json();

  // 处理订单
  console.log("Received new order:", orderDetails);

  // 延迟
  await new Promise(res => setTimeout(res, 1000));


  return NextResponse.json({
    success: true,
    message: "订单已提交",
    order: orderDetails,
  });
}