"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask } from "@/hooks/use-tasks";
import { TASK_PRIORITIES } from "@/lib/constants";
import type { Site, Vertical, SubSection } from "@/types";
import { toast } from "sonner";

interface QuickAddTaskProps {
  sites: Site[];
  verticals: (Vertical & { subSections: SubSection[] })[];
  defaultSiteId?: number;
}

// Helper to wrap base-ui onValueChange (which can pass null) for string state setters
function selectHandler(setter: (val: string) => void) {
  return (value: string | null) => setter(value ?? "");
}

export function QuickAddTask({ sites, verticals, defaultSiteId }: QuickAddTaskProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [siteId, setSiteId] = useState(defaultSiteId ? String(defaultSiteId) : "");
  const [verticalId, setVerticalId] = useState("");
  const [subSectionId, setSubSectionId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const createTask = useCreateTask();

  const selectedVertical = verticals.find((v) => v.id === Number(verticalId));
  const filteredSubSections = selectedVertical?.subSections || [];

  useEffect(() => {
    setSubSectionId("");
  }, [verticalId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !siteId || !verticalId) return;

    createTask.mutate(
      {
        title: title.trim(),
        siteId: Number(siteId),
        verticalId: Number(verticalId),
        subSectionId: subSectionId ? Number(subSectionId) : null,
        dueDate: dueDate || null,
        priority: priority as "high" | "medium" | "low",
      },
      {
        onSuccess: () => {
          toast.success("Task created");
          setTitle("");
          setSiteId(defaultSiteId ? String(defaultSiteId) : "");
          setVerticalId("");
          setSubSectionId("");
          setDueDate("");
          setPriority("medium");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="bg-terracotta hover:bg-terracotta-dark text-white" />}
      >
        <Plus className="size-4" />
        Add Task
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Quick Add Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Site</Label>
              <Select value={siteId || undefined} onValueChange={selectHandler(setSiteId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name.replace("Avera ", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={selectHandler(setPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Vertical</Label>
            <Select value={verticalId || undefined} onValueChange={selectHandler(setVerticalId)}>
              <SelectTrigger>
                <SelectValue placeholder="Select vertical" />
              </SelectTrigger>
              <SelectContent>
                {verticals.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredSubSections.length > 0 && (
            <div>
              <Label>Sub-section</Label>
              <Select value={subSectionId || undefined} onValueChange={selectHandler(setSubSectionId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-section (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubSections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-terracotta hover:bg-terracotta-dark text-white"
            disabled={createTask.isPending || !title.trim() || !siteId || !verticalId}
          >
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
