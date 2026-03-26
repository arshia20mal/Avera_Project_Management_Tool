import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTask, deleteTask } from "@/lib/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = getTaskById(Number(id));
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const task = updateTask(Number(id), body);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteTask(Number(id));
  return NextResponse.json({ success: true });
}
