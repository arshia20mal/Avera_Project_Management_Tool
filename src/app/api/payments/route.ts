import { NextRequest, NextResponse } from "next/server";
import { getPaymentsFiltered, createPayment } from "@/lib/queries";
import type { PaymentFilters } from "@/types";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters: PaymentFilters = {
    siteId: searchParams.get("siteId") ? Number(searchParams.get("siteId")) : undefined,
    verticalId: searchParams.get("verticalId") ? Number(searchParams.get("verticalId")) : undefined,
    status: (searchParams.get("status") as PaymentFilters["status"]) || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  };

  const data = getPaymentsFiltered(filters);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.vendor || !body.amount || !body.siteId || !body.verticalId || !body.paymentDate) {
    return NextResponse.json(
      { error: "vendor, amount, siteId, verticalId, and paymentDate are required" },
      { status: 400 }
    );
  }

  const payment = createPayment(body);
  return NextResponse.json(payment, { status: 201 });
}
