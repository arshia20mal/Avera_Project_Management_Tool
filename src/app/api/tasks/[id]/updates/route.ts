import { NextRequest, NextResponse } from "next/server";
import { getTaskUpdates, createTaskUpdate } from "@/lib/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = getTaskUpdates(Number(id));
  return NextResponse.json(updates);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.content?.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const update = createTaskUpdate(Number(id), body.content.trim());
  return NextResponse.json(update, { status: 201 });
}
