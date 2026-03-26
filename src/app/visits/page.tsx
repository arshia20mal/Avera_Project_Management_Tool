import { PageHeader } from "@/components/layout/page-header";
import { VisitsContent } from "@/components/visits/visits-content";
import { getAllSites } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function VisitsPage() {
  const sites = getAllSites();

  return (
    <>
      <PageHeader
        title="Site Visits"
        description="Track planned and completed site visits"
      />
      <VisitsContent sites={sites} />
    </>
  );
}
