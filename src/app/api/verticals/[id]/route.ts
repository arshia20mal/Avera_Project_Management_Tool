import { NextRequest, NextResponse } from "next/server";
import { updateVertical, deleteVertical, getTaskCountByVertical } from "@/lib/queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const vertical = updateVertical(Number(id), body);
  return NextResponse.json(vertical);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskCount = getTaskCountByVertical(Number(id));
  deleteVertical(Number(id));
  return NextResponse.json({ success: true, deletedTasks: taskCount });
}
