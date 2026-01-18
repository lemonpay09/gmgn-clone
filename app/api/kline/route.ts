import { NextResponse } from "next/server";
import klineData from "@/data/kline.json";

export async function GET() {

  return NextResponse.json(klineData);
}