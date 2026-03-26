import { NextRequest, NextResponse } from "next/server";
import { updateSubSection, deleteSubSection } from "@/lib/queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const subSection = updateSubSection(Number(id), body);
  return NextResponse.json(subSection);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteSubSection(Number(id));
  return NextResponse.json({ success: true });
}
