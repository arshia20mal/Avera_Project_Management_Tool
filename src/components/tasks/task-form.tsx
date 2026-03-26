"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateTask, useUpdateTask, useDeleteTask, useTaskUpdates, useCreateTaskUpdate } from "@/hooks/use-tasks";
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { Task, Site, Vertical, SubSection } from "@/types";
import { toast } from "sonner";
import { Trash2, Send } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

function selectHandler(setter: (val: string) => void) {
  return (value: string | null) => setter(value ?? "");
}

interface TaskFormProps {
  task?: Task;
  sites: Site[];
  verticals: (Vertical & { subSections: SubSection[] })[];
  defaultSiteId?: number;
}

function formatUpdateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, "MMM d");
}

function TaskUpdatesTimeline({ taskId }: { taskId: number }) {
  const { data: updates, isLoading } = useTaskUpdates(taskId);
  const createUpdate = useCreateTaskUpdate();
  const [newUpdate, setNewUpdate] = useState("");

  const handleSubmit = () => {
    if (!newUpdate.trim()) return;
    createUpdate.mutate(
      { taskId, content: newUpdate.trim() },
      {
        onSuccess: () => {
          setNewUpdate("");
          toast.success("Update added");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl mt-8 space-y-4">
      <h3 className="text-sm font-medium text-foreground">Updates</h3>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add an update..."
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleSubmit}
          disabled={createUpdate.isPending || !newUpdate.trim()}
          className="shrink-0"
        >
          <Send className="size-4 mr-1" />
          Post
        </Button>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading updates...</div>
      ) : updates && updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((update) => (
            <div key={update.id} className="border-l-2 border-muted pl-4 py-1">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {update.content}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatUpdateTime(update.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No updates yet.</p>
      )}
    </div>
  );
}

export function TaskForm({ task, sites, verticals, defaultSiteId }: TaskFormProps) {
  const router = useRouter();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [siteId, setSiteId] = useState(
    task?.siteId ? String(task.siteId) : defaultSiteId ? String(defaultSiteId) : ""
  );
  const [verticalId, setVerticalId] = useState(
    task?.verticalId ? String(task.verticalId) : ""
  );
  const [subSectionId, setSubSectionId] = useState(
    task?.subSectionId ? String(task.subSectionId) : ""
  );
  const [status, setStatus] = useState<string>(task?.status || "not_started");
  const [priority, setPriority] = useState<string>(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || "");
  const [notes, setNotes] = useState(task?.notes || "");

  const selectedVertical = verticals.find((v) => v.id === Number(verticalId));
  const filteredSubSections = selectedVertical?.subSections || [];

  useEffect(() => {
    if (!isEditing) setSubSectionId("");
  }, [verticalId, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !siteId || !verticalId) return;

    const data = {
      title: title.trim(),
      siteId: Number(siteId),
      verticalId: Number(verticalId),
      subSectionId: subSectionId ? Number(subSectionId) : null,
      status: status as "not_started" | "in_progress" | "completed",
      priority: priority as "high" | "medium" | "low",
      dueDate: dueDate || null,
      assignedTo: assignedTo.trim() || null,
      notes: notes.trim() || null,
    };

    if (isEditing) {
      updateTask.mutate(
        { id: task.id, ...data },
        {
          onSuccess: () => {
            toast.success("Task updated");
            router.push("/tasks");
          },
        }
      );
    } else {
      createTask.mutate(data, {
        onSuccess: () => {
          toast.success("Task created");
          router.push("/tasks");
        },
      });
    }
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success("Task deleted");
        router.push("/tasks");
      },
    });
  };

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Site *</Label>
          <Select value={siteId || undefined} onValueChange={selectHandler(setSiteId)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select site" />
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

        <div>
          <Label>Vertical *</Label>
          <Select value={verticalId || undefined} onValueChange={selectHandler(setVerticalId)}>
            <SelectTrigger className="mt-1">
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
      </div>

      {filteredSubSections.length > 0 && (
        <div>
          <Label>Sub-section</Label>
          <Select value={subSectionId || undefined} onValueChange={selectHandler(setSubSectionId)}>
            <SelectTrigger className="mt-1">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={selectHandler(setStatus)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Priority</Label>
          <Select value={priority} onValueChange={selectHandler(setPriority)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_CONFIG[p].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="assignedTo">Assigned To</Label>
        <Input
          id="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Name or role"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="notes">Description</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Initial task description or context..."
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="bg-terracotta hover:bg-terracotta-dark text-white"
            disabled={isPending || !title.trim() || !siteId || !verticalId}
          >
            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Task"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>

        {isEditing && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={<Button variant="destructive" size="sm" />}
            >
              <Trash2 className="size-4 mr-1" />
              Delete
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Task</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete &ldquo;{task.title}&rdquo;? This cannot be undone.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isEditing && task && (
        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>Created: {formatDateTime(task.createdAt)}</p>
          <p>Last updated: {formatDateTime(task.updatedAt)}</p>
        </div>
      )}
    </form>

    {isEditing && task && (
      <TaskUpdatesTimeline taskId={task.id} />
    )}
    </>
  );
}
