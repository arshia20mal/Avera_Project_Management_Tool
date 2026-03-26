import { NextRequest, NextResponse } from "next/server";
import { getTasksFiltered, createTask } from "@/lib/queries";
import type { TaskFilters } from "@/types";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters: TaskFilters = {
    siteId: searchParams.get("siteId") ? Number(searchParams.get("siteId")) : undefined,
    verticalId: searchParams.get("verticalId") ? Number(searchParams.get("verticalId")) : undefined,
    subSectionId: searchParams.get("subSectionId") ? Number(searchParams.get("subSectionId")) : undefined,
    status: (searchParams.get("status") as TaskFilters["status"]) || undefined,
    priority: (searchParams.get("priority") as TaskFilters["priority"]) || undefined,
    dueDateFrom: searchParams.get("dueDateFrom") || undefined,
    dueDateTo: searchParams.get("dueDateTo") || undefined,
    search: searchParams.get("search") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
  };

  const data = getTasksFiltered(filters);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title || !body.siteId || !body.verticalId) {
    return NextResponse.json(
      { error: "title, siteId, and verticalId are required" },
      { status: 400 }
    );
  }

  const task = createTask(body);
  return NextResponse.json(task, { status: 201 });
}
