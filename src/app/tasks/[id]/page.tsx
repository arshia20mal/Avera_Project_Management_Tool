import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TaskForm } from "@/components/tasks/task-form";
import { getTaskById, getAllSites, getVerticalsWithSubSections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getTaskById(Number(id));

  if (!task) notFound();

  const sites = getAllSites();
  const verticals = getVerticalsWithSubSections();

  return (
    <>
      <PageHeader
        title={task.title}
        breadcrumbs={[
          { label: "Tasks", href: "/tasks" },
          { label: task.title },
        ]}
      />
      <TaskForm task={task} sites={sites} verticals={verticals} />
    </>
  );
}
