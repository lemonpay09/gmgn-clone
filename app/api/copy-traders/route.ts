import { NextResponse } from "next/server";
import tradersData from "@/data/copyTraders.json";

export async function GET() {
  return NextResponse.json(tradersData);
}