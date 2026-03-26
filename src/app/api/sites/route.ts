import { NextResponse } from "next/server";
import { getAllSites } from "@/lib/queries";

export function GET() {
  const data = getAllSites();
  return NextResponse.json(data);
}
