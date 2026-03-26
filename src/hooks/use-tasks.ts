"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskUpdate, TaskFilters, DashboardData } from "@/types";

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      return res.json();
    },
  });
}

export function useTasks(filters: TaskFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return useQuery<{ items: Task[]; total: number; page: number; pageSize: number }>({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?${params}`);
      return res.json();
    },
  });
}

export function useTask(id: number) {
  return useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: number }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useTaskUpdates(taskId: number) {
  return useQuery<TaskUpdate[]>({
    queryKey: ["task-updates", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/updates`);
      return res.json();
    },
    enabled: !!taskId,
  });
}

export function useCreateTaskUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: number; content: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to create update");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-updates", variables.taskId] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
