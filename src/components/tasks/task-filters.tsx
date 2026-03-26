"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { STATUS_CONFIG, PRIORITY_CONFIG, TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";
import type { Site, Vertical, SubSection } from "@/types";
import { useFilters } from "@/hooks/use-filters";
import { useState, useEffect } from "react";

interface TaskFiltersProps {
  sites: Site[];
  verticals: (Vertical & { subSections: SubSection[] })[];
}

function selectHandler(setter: (val: string) => void) {
  return (value: string | null) => setter(value ?? "");
}

function FilterControls({ sites, verticals }: TaskFiltersProps) {
  const { getFilter, setFilter, clearFilters, hasActiveFilters } = useFilters();
  const selectedVerticalId = getFilter("verticalId");
  const selectedVertical = verticals.find((v) => v.id === Number(selectedVerticalId));
  const subSections = selectedVertical?.subSections || [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Select
          value={getFilter("siteId") ?? undefined}
          onValueChange={(v) => setFilter("siteId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Sites" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name.replace("Avera ", "")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={getFilter("verticalId") ?? undefined}
          onValueChange={(v) => setFilter("verticalId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Verticals" />
          </SelectTrigger>
          <SelectContent>
            {verticals.map((v) => (
              <SelectItem key={v.id} value={String(v.id)}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {subSections.length > 0 && (
          <Select
            value={getFilter("subSectionId") ?? undefined}
            onValueChange={(v) => setFilter("subSectionId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sub-sections" />
            </SelectTrigger>
            <SelectContent>
              {subSections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={getFilter("status") ?? undefined}
          onValueChange={(v) => setFilter("status", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={getFilter("priority") ?? undefined}
          onValueChange={(v) => setFilter("priority", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            {TASK_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_CONFIG[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
            <X className="size-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

export function TaskFilters({ sites, verticals }: TaskFiltersProps) {
  const { hasActiveFilters } = useFilters();

  return (
    <>
      {/* Desktop filters */}
      <div className="hidden md:block">
        <FilterControls sites={sites} verticals={verticals} />
      </div>

      {/* Mobile filter button + sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm" />
            }
          >
            <SlidersHorizontal className="size-4 mr-1.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 size-2 rounded-full bg-terracotta" />
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-8">
            <SheetHeader>
              <SheetTitle>Filter Tasks</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterControls sites={sites} verticals={verticals} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
