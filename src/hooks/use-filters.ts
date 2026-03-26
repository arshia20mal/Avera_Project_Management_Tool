"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getFilter = useCallback(
    (key: string) => searchParams.get(key) || undefined,
    [searchParams]
  );

  const getNumberFilter = useCallback(
    (key: string) => {
      const val = searchParams.get(key);
      return val ? Number(val) : undefined;
    },
    [searchParams]
  );

  const setFilter = useCallback(
    (key: string, value: string | number | undefined | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      // Reset to page 1 when filters change
      if (key !== "page") {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const setFilters = useCallback(
    (filters: Record<string, string | number | undefined | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasActiveFilters = searchParams.toString().length > 0;

  return {
    getFilter,
    getNumberFilter,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters,
    searchParams,
  };
}
