"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

const transferSchema = z.object({
  fromCategoryId: z.string().min(1, "Source is required"),
  toCategoryId: z.string().min(1, "Destination is required"),
  amount: z.number().positive("Amount must be positive"),
  transactionDate: z.string(),
  note: z.string().optional(),
}).refine(data => data.fromCategoryId !== data.toCategoryId, {
  message: "Source and destination cannot be the same",
  path: ["toCategoryId"],
});

type TransferInput = z.infer<typeof transferSchema>;

export function QuickTransfer() {
  const { accounts, addTransaction } = useFinanceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransferInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transactionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      note: "Quick Transfer",
      fromCategoryId: "",
      toCategoryId: "",
    },
  });

  const onSubmit = async (data: TransferInput) => {
    setIsSubmitting(true);
    try {
      addTransaction({
        transactionType: "TRANSFER",
        amount: data.amount,
        transactionDate: new Date(data.transactionDate).toISOString(),
        note: data.note || "Quick Transfer",
        fromCategoryId: data.fromCategoryId,
        toCategoryId: data.toCategoryId,
        accountId: "", // Transfers don't belong to a single account necessarily
      });
      toast.success("Quick transfer completed!");
      form.reset({
        transactionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        note: "Quick Transfer",
      });
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CategorySelectOptions = () => {
    return accounts.map((account) => {
      if (account.categories.length === 0) return null;
      return (
        <SelectGroup key={account.id}>
          <SelectLabel>{account.accountName}</SelectLabel>
          {account.categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.categoryName}
            </SelectItem>
          ))}
        </SelectGroup>
      );
    });
  };

  if (accounts.length === 0 || !accounts.some((a) => a.categories.length > 0)) {
    return null; // Don't show if no accounts or categories exist
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" />
          Quick Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            <Select
              value={form.watch("fromCategoryId")}
              onValueChange={(val) => form.setValue("fromCategoryId", val)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="From Category" />
              </SelectTrigger>
              <SelectContent>{CategorySelectOptions()}</SelectContent>
            </Select>

            <Select
              value={form.watch("toCategoryId")}
              onValueChange={(val) => form.setValue("toCategoryId", val)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="To Category" />
              </SelectTrigger>
              <SelectContent>{CategorySelectOptions()}</SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                className="h-9"
                {...form.register("amount", { valueAsNumber: true })}
              />
              <Button
                type="submit"
                className="h-9 shrink-0 gradient-primary text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Transfer"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
