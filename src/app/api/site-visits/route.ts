import { NextRequest, NextResponse } from "next/server";
import { getSiteVisits, createSiteVisit } from "@/lib/queries";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") || undefined;
  const data = getSiteVisits(month);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.siteId || !body.visitDate) {
    return NextResponse.json(
      { error: "siteId and visitDate are required" },
      { status: 400 }
    );
  }

  const visit = createSiteVisit(body);
  return NextResponse.json(visit, { status: 201 });
}
