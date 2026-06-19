"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { DateTimePicker } from "@/components/ui/date-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transferSchema,
  incomeExpenseSchema,
  type TransferInput,
  type IncomeExpenseInput,
} from "@/lib/validations";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "TRANSFER" | "INCOME" | "EXPENSE";
  defaultAccountId?: string;
}

export function TransactionForm({
  open,
  onOpenChange,
  defaultType = "EXPENSE",
  defaultAccountId,
}: TransactionFormProps) {
  const [activeTab, setActiveTab] = useState<"TRANSFER" | "INCOME" | "EXPENSE">(
    defaultType
  );
  
  const { accounts, addTransaction } = useFinanceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transfer Form
  const transferForm = useForm<TransferInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transactionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      fromCategoryId: "",
      toCategoryId: "",
    },
  });

  // Income/Expense Form
  const ieForm = useForm<IncomeExpenseInput>({
    resolver: zodResolver(incomeExpenseSchema),
    defaultValues: {
      transactionType: defaultType === "TRANSFER" ? "EXPENSE" : defaultType,
      transactionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      accountId: defaultAccountId || "",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (open) {
      setActiveTab(defaultType);
      transferForm.reset({
        transactionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        fromCategoryId: "",
        toCategoryId: "",
      });
      ieForm.reset({
        transactionType: defaultType === "TRANSFER" ? "EXPENSE" : defaultType,
        transactionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        accountId: defaultAccountId || "",
        categoryId: "",
      });
    }
  }, [open, defaultType, defaultAccountId, ieForm, transferForm]);

  useEffect(() => {
    if (activeTab !== "TRANSFER") {
      ieForm.setValue("transactionType", activeTab);
    }
  }, [activeTab, ieForm]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      transferForm.reset();
      ieForm.reset();
      setActiveTab(defaultType);
    }
    onOpenChange(newOpen);
  };

  const onTransferSubmit = async (data: TransferInput) => {
    setIsSubmitting(true);
    try {
      addTransaction({
        transactionType: "TRANSFER",
        amount: data.amount,
        transactionDate: new Date(data.transactionDate).toISOString(),
        note: data.note || null,
        fromCategoryId: data.fromCategoryId || null,
        toCategoryId: data.toCategoryId || null,
        accountId: "",
      });
      toast.success("Transfer completed successfully");
      handleOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onIESubmit = async (data: IncomeExpenseInput) => {
    setIsSubmitting(true);
    try {
      addTransaction({
        transactionType: data.transactionType,
        amount: data.amount,
        transactionDate: new Date(data.transactionDate).toISOString(),
        note: data.note || null,
        fromCategoryId: data.transactionType === "EXPENSE" ? data.categoryId : null,
        toCategoryId: data.transactionType === "INCOME" ? data.categoryId : null,
        accountId: data.accountId,
      });
      toast.success("Transaction recorded successfully");
      handleOpenChange(false);
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

  // Watch accountId to filter categories for Income/Expense
  const selectedAccountId = ieForm.watch("accountId");
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleOpenChange}
      title="New Transaction"
      description="Record an expense, log income, or transfer money."
    >
      {accounts.length === 0 ? (
        <div className="p-4 bg-muted rounded-md text-center">
          <p className="text-sm mb-4">You need to create an account first.</p>
          <Button onClick={() => handleOpenChange(false)}>Close</Button>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onValueChange={(v: any) => setActiveTab(v)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="EXPENSE" className="data-[state=active]:text-destructive text-xs sm:text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1 sm:mr-2" /> Expense
            </TabsTrigger>
            <TabsTrigger value="INCOME" className="data-[state=active]:text-green-600 text-xs sm:text-sm">
              <ArrowDownLeft className="h-4 w-4 mr-1 sm:mr-2" /> Income
            </TabsTrigger>
            <TabsTrigger value="TRANSFER" className="data-[state=active]:text-primary text-xs sm:text-sm">
              <ArrowRight className="h-4 w-4 mr-1 sm:mr-2" /> Transfer
            </TabsTrigger>
          </TabsList>

          {/* Income & Expense Forms */}
          {(activeTab === "INCOME" || activeTab === "EXPENSE") && (
            <form
              onSubmit={ieForm.handleSubmit(onIESubmit)}
              className="space-y-4"
            >
              <input type="hidden" {...ieForm.register("transactionType")} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label>Account</Label>
                  <Select
                    value={selectedAccountId}
                    onValueChange={(val) => {
                      ieForm.setValue("accountId", val);
                      ieForm.setValue("categoryId", ""); // Reset category
                    }}
                  >
                    <SelectTrigger className="h-11 sm:h-9">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {ieForm.formState.errors.accountId && (
                    <p className="text-xs text-destructive">
                      {ieForm.formState.errors.accountId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    disabled={!selectedAccountId}
                    value={ieForm.watch("categoryId")}
                    onValueChange={(val) => ieForm.setValue("categoryId", val)}
                  >
                    <SelectTrigger className="h-11 sm:h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedAccount?.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {ieForm.formState.errors.categoryId && (
                    <p className="text-xs text-destructive">
                      {ieForm.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-11 sm:h-9"
                    {...ieForm.register("amount", { valueAsNumber: true })}
                  />
                  {ieForm.formState.errors.amount && (
                    <p className="text-xs text-destructive">
                      {ieForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Controller
                    control={ieForm.control}
                    name="transactionDate"
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {ieForm.formState.errors.transactionDate && (
                    <p className="text-xs text-destructive">
                      {ieForm.formState.errors.transactionDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Textarea
                  placeholder="What was this for?"
                  className="resize-none"
                  {...ieForm.register("note")}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-9"
                disabled={isSubmitting}
                variant={activeTab === "EXPENSE" ? "destructive" : "default"}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {activeTab === "EXPENSE" ? "Record Expense" : "Log Income"}
              </Button>
            </form>
          )}

          {/* Transfer Form */}
          {activeTab === "TRANSFER" && (
            <TabsContent value="TRANSFER">
              <form
                onSubmit={transferForm.handleSubmit(onTransferSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-end">
                  <div className="space-y-2">
                    <Label>From Category</Label>
                    <Select
                      value={transferForm.watch("fromCategoryId")}
                      onValueChange={(val) =>
                        transferForm.setValue("fromCategoryId", val)
                      }
                    >
                      <SelectTrigger className="h-11 sm:h-9">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>{CategorySelectOptions()}</SelectContent>
                    </Select>
                    {transferForm.formState.errors.fromCategoryId && (
                      <p className="text-xs text-destructive">
                        {transferForm.formState.errors.fromCategoryId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>To Category</Label>
                    <Select
                      value={transferForm.watch("toCategoryId")}
                      onValueChange={(val) =>
                        transferForm.setValue("toCategoryId", val)
                      }
                    >
                      <SelectTrigger className="h-11 sm:h-9">
                        <SelectValue placeholder="Destination" />
                      </SelectTrigger>
                      <SelectContent>{CategorySelectOptions()}</SelectContent>
                    </Select>
                    {transferForm.formState.errors.toCategoryId && (
                      <p className="text-xs text-destructive">
                        {transferForm.formState.errors.toCategoryId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-11 sm:h-9"
                      {...transferForm.register("amount", {
                        valueAsNumber: true,
                      })}
                    />
                    {transferForm.formState.errors.amount && (
                      <p className="text-xs text-destructive">
                        {transferForm.formState.errors.amount.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Controller
                      control={transferForm.control}
                      name="transactionDate"
                      render={({ field }) => (
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Note (Optional)</Label>
                  <Textarea
                    placeholder="Transfer details..."
                    className="resize-none"
                    {...transferForm.register("note")}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-9 gradient-primary text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Complete Transfer
                </Button>
              </form>
            </TabsContent>
          )}
        </Tabs>
      )}
    </ResponsiveModal>
  );
}
