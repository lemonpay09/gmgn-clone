import { NextResponse } from "next/server";
import walletData from "@/data/wallet.json";

export async function GET() {
  // 在真实应用中，你会根据用户的会话从数据库中获取数据
  return NextResponse.json(walletData);
}