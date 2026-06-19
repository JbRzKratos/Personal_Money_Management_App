"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { BankAccountSerialized } from "@/types";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import {
  accountCreateSchema,
  accountEditSchema,
  type AccountCreateInput,
  type AccountEditInput,
} from "@/lib/validations";

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BankAccountSerialized | null;
}

export function AccountForm({
  open,
  onOpenChange,
  initialData,
}: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addAccount, updateAccount } = useFinanceStore();
  const isEditing = !!initialData;

  const createForm = useForm<AccountCreateInput>({
    resolver: zodResolver(accountCreateSchema),
    defaultValues: {
      accountName: "",
      description: "",
      initialBalance: 0,
    },
  });

  const editForm = useForm<AccountEditInput>({
    resolver: zodResolver(accountEditSchema),
    defaultValues: {
      accountName: initialData?.accountName || "",
      description: initialData?.description || "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      createForm.reset();
      editForm.reset();
    }
    onOpenChange(newOpen);
  };

  const onCreateSubmit = async (data: AccountCreateInput) => {
    setIsLoading(true);
    try {
      addAccount({
        accountName: data.accountName,
        description: data.description || null,
        initialBalance: data.initialBalance,
      });
      toast.success("Account created successfully");
      handleOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onEditSubmit = async (data: AccountEditInput) => {
    setIsLoading(true);
    try {
      if (initialData) {
        updateAccount(initialData.id, {
          accountName: data.accountName,
          description: data.description || null,
        });
        toast.success("Account updated successfully");
      }
      handleOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditing ? "Edit Account" : "Create New Account"}
      description={isEditing
        ? "Update your bank account details below."
        : "Add a new bank account or wallet to track your finances."}
    >

        {isEditing ? (
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g. HDFC Checking"
                className="h-11 sm:h-9"
                {...editForm.register("accountName")}
              />
              {editForm.formState.errors.accountName && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.accountName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g. Main account for salary and expenses"
                {...editForm.register("description")}
                className="resize-none"
              />
              {editForm.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="h-11 sm:h-9"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-primary text-white h-11 sm:h-9">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g. HDFC Checking"
                className="h-11 sm:h-9"
                {...createForm.register("accountName")}
              />
              {createForm.formState.errors.accountName && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.accountName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g. Main account for salary and expenses"
                {...createForm.register("description")}
                className="resize-none"
              />
              {createForm.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialBalance">Starting Balance</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-10 h-11 sm:h-9"
                  {...createForm.register("initialBalance", { valueAsNumber: true })}
                />
              </div>
              {createForm.formState.errors.initialBalance && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.initialBalance.message}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground">
                This sets your starting account balance. It will automatically create a default "General" category with this amount.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="h-11 sm:h-9"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-primary text-white h-11 sm:h-9">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </div>
          </form>
        )}
    </ResponsiveModal>
  );
}
