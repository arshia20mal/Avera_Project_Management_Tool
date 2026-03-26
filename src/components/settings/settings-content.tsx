"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Vertical, SubSection } from "@/types";
import { toast } from "sonner";

type VerticalWithSubs = Vertical & { subSections: SubSection[] };

export function SettingsContent() {
  const queryClient = useQueryClient();

  const { data: verticals, isLoading } = useQuery<VerticalWithSubs[]>({
    queryKey: ["verticals"],
    queryFn: async () => {
      const res = await fetch("/api/verticals");
      return res.json();
    },
  });

  // ── Vertical mutations ──
  const addVertical = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/verticals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
      toast.success("Vertical added");
    },
  });

  const editVertical = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await fetch(`/api/verticals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
      toast.success("Vertical updated");
    },
  });

  const removeVertical = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/verticals/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Vertical deleted");
    },
  });

  // ── Sub-section mutations ──
  const addSubSection = useMutation({
    mutationFn: async ({ verticalId, name }: { verticalId: number; name: string }) => {
      const res = await fetch("/api/sub-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verticalId, name }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
      toast.success("Sub-section added");
    },
  });

  const editSubSection = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await fetch(`/api/sub-sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
      toast.success("Sub-section updated");
    },
  });

  const removeSubSection = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/sub-sections/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
      toast.success("Sub-section deleted");
    },
  });

  if (isLoading || !verticals) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-ivory-light animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Accordion multiple className="space-y-2">
        {verticals.map((vertical) => (
          <AccordionItem
            key={vertical.id}
            value={String(vertical.id)}
            className="rounded-lg border border-border overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-ivory-light/50">
              <div className="flex items-center gap-3 flex-1">
                <span className="font-medium text-sm flex-1 text-left">
                  {vertical.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {vertical.subSections.length} sub-sections
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <InlineEditButton
                  label="Rename"
                  currentValue={vertical.name}
                  onSave={(name) => editVertical.mutate({ id: vertical.id, name })}
                />
                <DeleteButton
                  label={`Delete "${vertical.name}"`}
                  description="This will also delete all tasks and payments under this vertical."
                  onConfirm={() => removeVertical.mutate(vertical.id)}
                />
              </div>

              <div className="space-y-1 mb-3">
                {vertical.subSections.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-ivory-light/50 group"
                  >
                    <span className="text-sm flex-1">{sub.name}</span>
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <InlineEditButton
                        label="Rename"
                        currentValue={sub.name}
                        onSave={(name) => editSubSection.mutate({ id: sub.id, name })}
                        size="xs"
                      />
                      <DeleteButton
                        label={`Delete "${sub.name}"`}
                        description="Tasks under this sub-section will keep their vertical assignment."
                        onConfirm={() => removeSubSection.mutate(sub.id)}
                        size="xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <AddInline
                placeholder="Add sub-section..."
                onAdd={(name) =>
                  addSubSection.mutate({ verticalId: vertical.id, name })
                }
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddInline
        placeholder="Add new vertical..."
        onAdd={(name) => addVertical.mutate(name)}
      />
    </div>
  );
}

// ── Inline Add ──

function AddInline({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (name: string) => void;
}) {
  const [value, setValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="size-3.5 mr-1" />
        {placeholder}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
          if (e.key === "Escape") {
            setIsAdding(false);
            setValue("");
          }
        }}
        className="h-8 text-sm"
      />
      <Button size="sm" onClick={handleAdd} disabled={!value.trim()}>
        Add
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setIsAdding(false);
          setValue("");
        }}
      >
        Cancel
      </Button>
    </div>
  );
}

// ── Inline Edit Button ──

function InlineEditButton({
  label,
  currentValue,
  onSave,
  size = "default",
}: {
  label: string;
  currentValue: string;
  onSave: (value: string) => void;
  size?: "default" | "xs";
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentValue);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setValue(currentValue);
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size={size === "xs" ? "icon-xs" : "icon-sm"}
          />
        }
      >
        <Pencil className={size === "xs" ? "size-3" : "size-3.5"} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) {
              onSave(value.trim());
              setOpen(false);
            }
          }}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (value.trim()) {
                onSave(value.trim());
                setOpen(false);
              }
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Button ──

function DeleteButton({
  label,
  description,
  onConfirm,
  size = "default",
}: {
  label: string;
  description: string;
  onConfirm: () => void;
  size?: "default" | "xs";
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size={size === "xs" ? "icon-xs" : "icon-sm"}
            className="text-destructive hover:text-destructive"
          />
        }
      >
        <Trash2 className={size === "xs" ? "size-3" : "size-3.5"} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
