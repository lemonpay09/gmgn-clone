import { NextResponse } from "next/server";
import walletData from "@/data/wallet.json";

export async function GET() {

  return NextResponse.json(walletData);
}