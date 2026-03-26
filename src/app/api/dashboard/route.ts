import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export function GET() {
  const data = getDashboardData();
  return NextResponse.json(data);
}
