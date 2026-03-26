"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useDashboard, useUpdateTask } from "@/hooks/use-tasks";
import { usePayments, useUpdatePayment } from "@/hooks/use-payments";
import { useFilters } from "@/hooks/use-filters";
import { formatINR, formatINRCompact, formatDate } from "@/lib/format";
import { PAYMENT_STATUS_CONFIG } from "@/lib/constants";
import type { Site, Vertical, FinancialSummary, PaymentStatus } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const CHART_COLORS = ["#D35940", "#574C46", "#7EACC1", "#6B8F71", "#A49890", "#E8836F", "#3D352F", "#8BBDD4"];

interface PaymentsContentProps {
  sites: Site[];
  verticals: Vertical[];
  financialSummary: FinancialSummary;
}

function selectHandler(setter: (val: string) => void) {
  return (value: string | null) => setter(value ?? "");
}

export function PaymentsContent({
  sites,
  verticals,
  financialSummary,
}: PaymentsContentProps) {
  const { getFilter, getNumberFilter, setFilter, clearFilters, hasActiveFilters } = useFilters();
  const updatePayment = useUpdatePayment();

  const filters = {
    siteId: getNumberFilter("siteId"),
    verticalId: getNumberFilter("verticalId"),
    status: getFilter("status") as PaymentStatus | undefined,
    page: getNumberFilter("page") || 1,
  };

  const { data, isLoading } = usePayments(filters);

  const siteMap = Object.fromEntries(sites.map((s) => [s.id, s.name]));
  const verticalMap = Object.fromEntries(verticals.map((v) => [v.id, v.name]));

  const handleStatusToggle = (paymentId: number, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "paid" : "pending";
    updatePayment.mutate(
      { id: paymentId, status: newStatus },
      { onSuccess: () => toast.success(`Payment marked as ${newStatus}`) }
    );
  };

  const spendBySiteData = financialSummary.spendBySite
    .filter((s) => s.total > 0)
    .map((s) => ({ name: s.siteName.replace("Avera ", ""), value: s.total }));

  const spendByVerticalData = financialSummary.spendByVertical
    .filter((v) => v.total > 0)
    .map((v) => ({ name: v.verticalName, value: v.total }));

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Spend</p>
            <p className="text-2xl font-semibold text-taupe-dark">
              {formatINR(financialSummary.totalSpend)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-semibold text-terracotta">
              {formatINR(financialSummary.totalPending)}
            </p>
            <p className="text-xs text-muted-foreground">
              {financialSummary.pendingPaymentsCount} payments
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-semibold text-leaf-accent">
              {formatINR(financialSummary.totalPaid)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {spendBySiteData.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-5">
              <h3 className="font-display text-sm font-semibold text-taupe-dark mb-4">
                Spend by Site
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={spendBySiteData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => formatINRCompact(v)} fontSize={11} />
                  <YAxis type="category" dataKey="name" width={80} fontSize={11} />
                  <RechartsTooltip formatter={(value) => formatINR(Number(value))} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {spendBySiteData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {spendByVerticalData.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-5">
              <h3 className="font-display text-sm font-semibold text-taupe-dark mb-4">
                Spend by Vertical
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={spendByVerticalData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => formatINRCompact(v)} fontSize={11} />
                  <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                  <RechartsTooltip formatter={(value) => formatINR(Number(value))} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {spendByVerticalData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
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

        <Select
          value={getFilter("status") ?? undefined}
          onValueChange={(v) => setFilter("status", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <X className="size-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Payment table */}
      {isLoading || !data ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-ivory-light animate-pulse" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No payments found.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-ivory-light/50">
                  <TableHead>Vendor / Payee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Vertical</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-ivory-light/30">
                    <TableCell>
                      <Link
                        href={`/payments/${payment.id}`}
                        className="font-medium hover:text-terracotta transition-colors"
                      >
                        {payment.vendor}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatINR(payment.amount)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {siteMap[payment.siteId]?.replace("Avera ", "") || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {verticalMap[payment.verticalId] || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(payment.paymentDate)}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleStatusToggle(payment.id, payment.status)}>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "cursor-pointer text-xs",
                            PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus].bgColor,
                            PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus].color
                          )}
                        >
                          {PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus].label}
                        </Badge>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {data.items.map((payment) => (
              <Link
                key={payment.id}
                href={`/payments/${payment.id}`}
                className="block rounded-lg border border-border p-4 hover:bg-ivory-light/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{payment.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {siteMap[payment.siteId]?.replace("Avera ", "")} &middot;{" "}
                      {formatDate(payment.paymentDate)}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">{formatINR(payment.amount)}</p>
                </div>
                <div className="mt-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus].bgColor,
                      PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus].color
                    )}
                  >
                    {PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus].label}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((filters.page || 1) - 1) * (data.pageSize) + 1}–
                {Math.min((filters.page || 1) * data.pageSize, data.total)} of {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page || 1) <= 1}
                  onClick={() => setFilter("page", (filters.page || 1) - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm">{filters.page || 1} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page || 1) >= totalPages}
                  onClick={() => setFilter("page", (filters.page || 1) + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
