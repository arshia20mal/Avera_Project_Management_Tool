import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskListContent } from "@/components/tasks/task-list-content";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getAllSites, getVerticalsWithSubSections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function TaskListPage() {
  const sites = getAllSites();
  const verticals = getVerticalsWithSubSections();

  return (
    <>
      <PageHeader
        title="All Tasks"
        description="View and manage tasks across all properties"
        action={
          <Link href="/tasks/new">
            <Button className="bg-terracotta hover:bg-terracotta-dark text-white">
              <Plus className="size-4" />
              New Task
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<div className="h-64 rounded-lg bg-ivory-light animate-pulse" />}>
        <TaskListContent sites={sites} verticals={verticals} />
      </Suspense>
    </>
  );
}
