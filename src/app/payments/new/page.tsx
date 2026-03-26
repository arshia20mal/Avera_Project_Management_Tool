import { PageHeader } from "@/components/layout/page-header";
import { PaymentForm } from "@/components/payments/payment-form";
import { getAllSites, getAllVerticals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function NewPaymentPage() {
  const sites = getAllSites();
  const verticals = getAllVerticals();

  return (
    <>
      <PageHeader
        title="New Payment"
        breadcrumbs={[
          { label: "Payments", href: "/payments" },
          { label: "New Payment" },
        ]}
      />
      <PaymentForm sites={sites} verticals={verticals} />
    </>
  );
}
