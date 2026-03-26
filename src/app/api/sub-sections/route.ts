import { NextRequest, NextResponse } from "next/server";
import { createSubSection, getSubSectionsByVertical, getAllSubSections } from "@/lib/queries";

export function GET(request: NextRequest) {
  const verticalId = request.nextUrl.searchParams.get("verticalId");
  if (verticalId) {
    return NextResponse.json(getSubSectionsByVertical(Number(verticalId)));
  }
  return NextResponse.json(getAllSubSections());
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.verticalId || !body.name) {
    return NextResponse.json(
      { error: "verticalId and name are required" },
      { status: 400 }
    );
  }

  const existing = getSubSectionsByVertical(body.verticalId);
  const maxSortOrder = Math.max(0, ...existing.map((s) => s.sortOrder));

  const subSection = createSubSection(
    body.verticalId,
    body.name,
    body.sortOrder ?? maxSortOrder + 1
  );
  return NextResponse.json(subSection, { status: 201 });
}
