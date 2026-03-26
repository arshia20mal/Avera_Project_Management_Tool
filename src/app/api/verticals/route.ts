import { NextRequest, NextResponse } from "next/server";
import { getVerticalsWithSubSections, createVertical, getAllVerticals } from "@/lib/queries";

export function GET() {
  const data = getVerticalsWithSubSections();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const allVerticals = getAllVerticals();
  const maxSortOrder = Math.max(0, ...allVerticals.map((v) => v.sortOrder));

  const vertical = createVertical(body.name, body.sortOrder ?? maxSortOrder + 1);
  return NextResponse.json(vertical, { status: 201 });
}
