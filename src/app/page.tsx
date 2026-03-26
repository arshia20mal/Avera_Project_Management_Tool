import { PageHeader } from "@/components/layout/page-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { QuickAddTask } from "@/components/dashboard/quick-add-task";
import { getAllSites, getVerticalsWithSubSections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const sites = getAllSites();
  const verticals = getVerticalsWithSubSections();

  return (
    <>
      <PageHeader
        title="Project Command Center"
        description="Overview of all Avera properties"
        action={
          <div className="hidden md:block">
            <QuickAddTask sites={sites} verticals={verticals} />
          </div>
        }
      />
      <DashboardContent sites={sites} verticals={verticals} />
    </>
  );
}
