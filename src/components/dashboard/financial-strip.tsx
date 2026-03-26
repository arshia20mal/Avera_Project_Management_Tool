"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, Clock, TrendingUp } from "lucide-react";
import { formatINRCompact, formatINR } from "@/lib/format";
import type { FinancialSummary } from "@/types";

export function FinancialStrip({ summary }: { summary: FinancialSummary }) {
  return (
    <Link href="/payments">
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-border/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="size-4 text-terracotta" />
            <h3 className="font-display text-sm font-semibold text-taupe-dark">
              Financial Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Spend</p>
              <p className="text-lg font-semibold text-taupe-dark">
                {formatINRCompact(summary.totalSpend)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-terracotta">
                {formatINRCompact(summary.totalPending)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.pendingPaymentsCount} payments
              </p>
            </div>
            {summary.spendBySite
              .filter((s) => s.total > 0)
              .slice(0, 2)
              .map((s) => (
                <div key={s.siteId}>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.siteName.replace("Avera ", "")}
                  </p>
                  <p className="text-lg font-semibold text-taupe">
                    {formatINRCompact(s.total)}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
