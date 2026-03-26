import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentForm } from "@/components/payments/payment-form";
import { getPaymentById, getAllSites, getAllVerticals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payment = getPaymentById(Number(id));

  if (!payment) notFound();

  const sites = getAllSites();
  const verticals = getAllVerticals();

  return (
    <>
      <PageHeader
        title={`Payment — ${payment.vendor}`}
        breadcrumbs={[
          { label: "Payments", href: "/payments" },
          { label: payment.vendor },
        ]}
      />
      <PaymentForm payment={payment} sites={sites} verticals={verticals} />
    </>
  );
}
