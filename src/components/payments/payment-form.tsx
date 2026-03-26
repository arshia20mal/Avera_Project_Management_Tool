"use client";

import { useState } from "react";
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
import { useCreatePayment, useUpdatePayment, useDeletePayment } from "@/hooks/use-payments";
import { PAYMENT_STATUSES, PAYMENT_STATUS_CONFIG } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { Payment, Site, Vertical } from "@/types";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

function selectHandler(setter: (val: string) => void) {
  return (value: string | null) => setter(value ?? "");
}

interface PaymentFormProps {
  payment?: Payment;
  sites: Site[];
  verticals: Vertical[];
}

export function PaymentForm({ payment, sites, verticals }: PaymentFormProps) {
  const router = useRouter();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isEditing = !!payment;

  const [vendor, setVendor] = useState(payment?.vendor || "");
  const [amount, setAmount] = useState(payment?.amount ? String(payment.amount) : "");
  const [siteId, setSiteId] = useState(payment?.siteId ? String(payment.siteId) : "");
  const [verticalId, setVerticalId] = useState(payment?.verticalId ? String(payment.verticalId) : "");
  const [paymentDate, setPaymentDate] = useState(payment?.paymentDate || "");
  const [status, setStatus] = useState<string>(payment?.status || "pending");
  const [notes, setNotes] = useState(payment?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || !amount || !siteId || !verticalId || !paymentDate) return;

    const data = {
      vendor: vendor.trim(),
      amount: Number(amount),
      siteId: Number(siteId),
      verticalId: Number(verticalId),
      paymentDate,
      status: status as "pending" | "paid",
      notes: notes.trim() || null,
    };

    if (isEditing) {
      updatePayment.mutate(
        { id: payment.id, ...data },
        {
          onSuccess: () => {
            toast.success("Payment updated");
            router.push("/payments");
          },
        }
      );
    } else {
      createPayment.mutate(data, {
        onSuccess: () => {
          toast.success("Payment recorded");
          router.push("/payments");
        },
      });
    }
  };

  const handleDelete = () => {
    if (!payment) return;
    deletePayment.mutate(payment.id, {
      onSuccess: () => {
        toast.success("Payment deleted");
        router.push("/payments");
      },
    });
  };

  const isPending = createPayment.isPending || updatePayment.isPending;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <Label htmlFor="vendor">Vendor / Payee *</Label>
        <Input
          id="vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          placeholder="Contractor, supplier, or consultant name"
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="paymentDate">Payment Date *</Label>
          <Input
            id="paymentDate"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={selectHandler(setStatus)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {PAYMENT_STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Invoice reference, description, or context..."
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="bg-terracotta hover:bg-terracotta-dark text-white"
            disabled={isPending || !vendor.trim() || !amount || !siteId || !verticalId || !paymentDate}
          >
            {isPending
              ? isEditing ? "Saving..." : "Recording..."
              : isEditing ? "Save Changes" : "Record Payment"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        {isEditing && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger render={<Button variant="destructive" size="sm" />}>
              <Trash2 className="size-4 mr-1" />
              Delete
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Payment</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this payment record? This cannot be undone.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deletePayment.isPending}>
                  {deletePayment.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isEditing && payment && (
        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>Created: {formatDateTime(payment.createdAt)}</p>
          <p>Last updated: {formatDateTime(payment.updatedAt)}</p>
        </div>
      )}
    </form>
  );
}
