import { NextRequest, NextResponse } from "next/server";
import { getPaymentById, updatePayment, deletePayment } from "@/lib/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payment = getPaymentById(Number(id));
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  return NextResponse.json(payment);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const payment = updatePayment(Number(id), body);
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  return NextResponse.json(payment);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deletePayment(Number(id));
  return NextResponse.json({ success: true });
}
