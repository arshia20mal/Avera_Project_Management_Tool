import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SiteDetailContent } from "@/components/sites/site-detail-content";
import { QuickAddTask } from "@/components/dashboard/quick-add-task";
import { getSiteBySlug, getAllVerticals, getAllSubSections, getVerticalsWithSubSections } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);

  if (!site) notFound();

  const verticals = getAllVerticals();
  const subSections = getAllSubSections();
  const verticalsWithSubs = getVerticalsWithSubSections();

  return (
    <>
      <PageHeader
        title={site.name}
        description={site.location}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: site.name },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/tasks/new?siteId=${site.id}`}>
              <Button className="bg-terracotta hover:bg-terracotta-dark text-white">
                <Plus className="size-4" />
                Add Task
              </Button>
            </Link>
          </div>
        }
      />
      <Suspense fallback={<div className="h-64 rounded-lg bg-ivory-light animate-pulse" />}>
        <SiteDetailContent
          site={site}
          verticals={verticals}
          subSections={subSections}
        />
      </Suspense>
    </>
  );
}
