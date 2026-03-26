"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, MapPin, Check, Calendar, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameMonth } from "date-fns";
import type { Site, SiteVisit } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function selectHandler(setter: (val: string) => void) {
  return (value: string | null) => setter(value ?? "");
}

interface VisitsContentProps {
  sites: Site[];
}

export function VisitsContent({ sites }: VisitsContentProps) {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const monthStr = format(currentMonth, "yyyy-MM");

  const { data: visits = [] } = useQuery<SiteVisit[]>({
    queryKey: ["site-visits", monthStr],
    queryFn: async () => {
      const res = await fetch(`/api/site-visits?month=${monthStr}`);
      return res.json();
    },
  });

  const addVisit = useMutation({
    mutationFn: async (data: { siteId: number; visitDate: string; visitType: string; purpose: string; notes: string }) => {
      const res = await fetch("/api/site-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-visits"] });
      toast.success("Site visit added");
      setAddOpen(false);
    },
  });

  const toggleVisitType = useMutation({
    mutationFn: async ({ id, visitType }: { id: number; visitType: string }) => {
      const res = await fetch(`/api/site-visits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitType }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-visits"] });
      toast.success("Visit updated");
    },
  });

  const deleteVisit = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/site-visits/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-visits"] });
      toast.success("Visit removed");
    },
  });

  const siteMap = Object.fromEntries(sites.map((s) => [s.id, s]));

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart); // 0=Sun

  // Group visits by date
  const visitsByDate = useMemo(() => {
    const map: Record<string, SiteVisit[]> = {};
    for (const v of visits) {
      if (!map[v.visitDate]) map[v.visitDate] = [];
      map[v.visitDate].push(v);
    }
    return map;
  }, [visits]);

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="font-display text-lg font-semibold min-w-[180px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Calendar grid */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month start */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] md:min-h-[100px] border-b border-r border-border bg-ivory-light/30" />
            ))}

            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayVisits = visitsByDate[dateStr] || [];
              const today = isToday(day);

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "min-h-[80px] md:min-h-[100px] border-b border-r border-border p-1.5 cursor-pointer hover:bg-ivory-light/50 transition-colors",
                    today && "bg-terracotta/5"
                  )}
                  onClick={() => handleDayClick(dateStr)}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center size-6 text-xs font-medium rounded-full",
                      today && "bg-terracotta text-white"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayVisits.map((visit) => {
                      const site = siteMap[visit.siteId];
                      return (
                        <div
                          key={visit.id}
                          className={cn(
                            "flex items-center gap-1 text-[10px] md:text-xs px-1.5 py-0.5 rounded-md truncate",
                            visit.visitType === "completed"
                              ? "bg-leaf-accent/15 text-leaf-accent"
                              : "bg-sky-accent/15 text-sky-accent"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {visit.visitType === "completed" ? (
                            <Check className="size-2.5 shrink-0" />
                          ) : (
                            <Calendar className="size-2.5 shrink-0" />
                          )}
                          <span className="truncate">
                            {site?.name.replace("Avera ", "") || ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming visits list */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <h3 className="font-display text-sm font-semibold text-taupe-dark mb-3">
            Visits This Month
          </h3>
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No site visits scheduled for {format(currentMonth, "MMMM yyyy")}. Click any day on the calendar to add one.
            </p>
          ) : (
            <div className="space-y-2">
              {visits.map((visit) => {
                const site = siteMap[visit.siteId];
                return (
                  <div
                    key={visit.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-ivory-light/50 group"
                  >
                    <button
                      onClick={() =>
                        toggleVisitType.mutate({
                          id: visit.id,
                          visitType: visit.visitType === "planned" ? "completed" : "planned",
                        })
                      }
                      className={cn(
                        "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        visit.visitType === "completed"
                          ? "border-leaf-accent bg-leaf-accent text-white"
                          : "border-sky-accent hover:bg-sky-accent/10"
                      )}
                    >
                      {visit.visitType === "completed" && <Check className="size-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        <MapPin className="size-3 inline mr-1 text-muted-foreground" />
                        {site?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(visit.visitDate), "EEE, dd MMM")}
                        {visit.purpose && ` — ${visit.purpose}`}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        visit.visitType === "completed"
                          ? "bg-leaf-accent/15 text-leaf-accent"
                          : "bg-sky-accent/15 text-sky-accent"
                      )}
                    >
                      {visit.visitType === "completed" ? "Visited" : "Planned"}
                    </Badge>
                    <button
                      onClick={() => deleteVisit.mutate(visit.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add visit dialog */}
      <AddVisitDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        sites={sites}
        defaultDate={selectedDate}
        onSubmit={(data) => addVisit.mutate(data)}
        isPending={addVisit.isPending}
      />
    </div>
  );
}

function AddVisitDialog({
  open,
  onOpenChange,
  sites,
  defaultDate,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sites: Site[];
  defaultDate: string;
  onSubmit: (data: { siteId: number; visitDate: string; visitType: string; purpose: string; notes: string }) => void;
  isPending: boolean;
}) {
  const [siteId, setSiteId] = useState("");
  const [visitDate, setVisitDate] = useState(defaultDate);
  const [visitType, setVisitType] = useState("planned");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  // Sync defaultDate when dialog opens
  const prevOpen = useState(open)[0];
  if (open && visitDate !== defaultDate && defaultDate) {
    setVisitDate(defaultDate);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId || !visitDate) return;
    onSubmit({
      siteId: Number(siteId),
      visitDate,
      visitType,
      purpose,
      notes,
    });
    setSiteId("");
    setPurpose("");
    setNotes("");
    setVisitType("planned");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Site Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Site *</Label>
            <Select value={siteId || undefined} onValueChange={selectHandler(setSiteId)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Which property?" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="visitDate">Date *</Label>
              <Input
                id="visitDate"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={visitType} onValueChange={selectHandler(setVisitType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Construction review, snag inspection"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details..."
              rows={2}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-terracotta hover:bg-terracotta-dark text-white"
            disabled={isPending || !siteId || !visitDate}
          >
            {isPending ? "Adding..." : "Add Visit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
