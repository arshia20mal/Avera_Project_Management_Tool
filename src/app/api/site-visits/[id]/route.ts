import { NextRequest, NextResponse } from "next/server";
import { updateSiteVisit, deleteSiteVisit } from "@/lib/queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const visit = updateSiteVisit(Number(id), body);
  return NextResponse.json(visit);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteSiteVisit(Number(id));
  return NextResponse.json({ success: true });
}
