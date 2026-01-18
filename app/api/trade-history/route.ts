import { NextResponse } from "next/server";
import historyData from "@/data/tradeHistory.json";

export async function GET() {
  return NextResponse.json(historyData);
}
