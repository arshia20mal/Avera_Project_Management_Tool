import { PageHeader } from "@/components/layout/page-header";
import { TaskForm } from "@/components/tasks/task-form";
import { getAllSites, getVerticalsWithSubSections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function NewTaskPage() {
  const sites = getAllSites();
  const verticals = getVerticalsWithSubSections();

  return (
    <>
      <PageHeader
        title="New Task"
        breadcrumbs={[
          { label: "Tasks", href: "/tasks" },
          { label: "New Task" },
        ]}
      />
      <TaskForm sites={sites} verticals={verticals} />
    </>
  );
}
