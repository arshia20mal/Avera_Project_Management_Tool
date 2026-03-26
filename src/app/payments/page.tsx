import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentsContent } from "@/components/payments/payments-content";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getAllSites, getAllVerticals, getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function PaymentsPage() {
  const sites = getAllSites();
  const verticals = getAllVerticals();
  const dashboardData = getDashboardData();

  return (
    <>
      <PageHeader
        title="Financial Overview"
        description="Track payments across all properties"
        action={
          <Link href="/payments/new">
            <Button className="bg-terracotta hover:bg-terracotta-dark text-white">
              <Plus className="size-4" />
              New Payment
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<div className="h-64 rounded-lg bg-ivory-light animate-pulse" />}>
        <PaymentsContent
          sites={sites}
          verticals={verticals}
          financialSummary={dashboardData.financialSummary}
        />
      </Suspense>
    </>
  );
}
