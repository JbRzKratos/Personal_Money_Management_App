"use client";

import { useState, useEffect } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import type { SavingsGoalSerialized, SubGoalSerialized } from "@/types";

interface AddMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: SavingsGoalSerialized | null;
  subGoal?: SubGoalSerialized | null;
}

export function AddMoneyModal({
  open,
  onOpenChange,
  goal,
  subGoal,
}: AddMoneyModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [selectedSubGoalId, setSelectedSubGoalId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { accounts, addTransaction, updateGoal, updateSubGoal } = useFinanceStore();

  // Determine if we need to select a sub-goal
  const hasSubGoals = goal ? goal.subGoals.length > 0 : false;

  // Reset form when modal state changes
  useEffect(() => {
    if (open) {
      setAmount("");
      setSelectedSubGoalId("");
      setSelectedCategoryId("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Please select an account/category to deduct funds from");
      return;
    }

    // Find the selected category and account
    let selectedAccount = null;
    let selectedCategory = null;

    for (const acc of accounts) {
      const cat = acc.categories.find((c) => c.id === selectedCategoryId);
      if (cat) {
        selectedAccount = acc;
        selectedCategory = cat;
        break;
      }
    }

    if (!selectedCategory || !selectedAccount) {
      toast.error("Invalid source category selected");
      return;
    }

    // Insufficient funds check
    if (selectedCategory.currentBalance < numAmount) {
      toast.error(
        `Insufficient funds in ${
          selectedCategory.categoryName
        } (Current Balance: $${selectedCategory.currentBalance.toLocaleString()})`
      );
      return;
    }

    setIsLoading(true);
    try {
      const displayName = subGoal
        ? subGoal.subGoalName
        : goal
        ? goal.goalName
        : "Savings Goal";

      // 1. Log the Transfer Transaction to deduct the amount from category without counting as an expense
      addTransaction({
        transactionType: "TRANSFER",
        amount: numAmount,
        transactionDate: new Date().toISOString(),
        note: `Savings allocation for "${displayName}"`,
        fromCategoryId: selectedCategoryId,
        toCategoryId: null,
        accountId: selectedAccount.id,
      });

      // 2. Add the amount to the target Goal or Sub-goal
      if (subGoal) {
        // Direct update on sub-goal
        updateSubGoal(subGoal.id, {
          currentAmount: subGoal.currentAmount + numAmount,
        });
        toast.success(`Allocated $${numAmount.toLocaleString()} from ${selectedCategory.categoryName} to milestone: ${subGoal.subGoalName}`);
        onOpenChange(false);
      } else if (goal) {
        if (hasSubGoals) {
          if (!selectedSubGoalId) {
            toast.error("Please select a milestone to allocate funds to");
            setIsLoading(false);
            return;
          }
          const targetSubGoal = goal.subGoals.find((sg) => sg.id === selectedSubGoalId);
          if (!targetSubGoal) {
            toast.error("Invalid milestone selected");
            setIsLoading(false);
            return;
          }

          updateSubGoal(targetSubGoal.id, {
            currentAmount: targetSubGoal.currentAmount + numAmount,
          });
          toast.success(`Allocated $${numAmount.toLocaleString()} from ${selectedCategory.categoryName} to milestone: ${targetSubGoal.subGoalName}`);
          onOpenChange(false);
        } else {
          // Direct update on standalone goal
          updateGoal(goal.id, {
            currentAmount: goal.currentAmount + numAmount,
          });
          toast.success(`Allocated $${numAmount.toLocaleString()} from ${selectedCategory.categoryName} to goal: ${goal.goalName}`);
          onOpenChange(false);
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = subGoal
    ? subGoal.subGoalName
    : goal
    ? goal.goalName
    : "Goal";

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Add Money to ${displayName}`}
      description="Select a source category to allocate money from. The amount will be deducted from your account."
    >

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Category Dropdown (Required) */}
          <div className="space-y-2">
            <Label>Deduct From Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger className="h-11 sm:h-9">
                <SelectValue placeholder="Select category to deduct from" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => {
                  if (account.categories.length === 0) return null;
                  return (
                    <SelectGroup key={account.id}>
                      <SelectLabel>{account.accountName}</SelectLabel>
                      {account.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.categoryName} (Bal: ${cat.currentBalance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* If choosing a milestone for a parent goal */}
          {goal && hasSubGoals && (
            <div className="space-y-2">
              <Label>Select Target Milestone</Label>
              <Select
                value={selectedSubGoalId}
                onValueChange={setSelectedSubGoalId}
              >
                <SelectTrigger className="h-11 sm:h-9">
                  <SelectValue placeholder="Choose a milestone" />
                </SelectTrigger>
                <SelectContent>
                  {goal.subGoals.map((sg) => (
                    <SelectItem key={sg.id} value={sg.id}>
                      {sg.subGoalName} (Saved: ${sg.currentAmount.toLocaleString()} / ${sg.targetAmount.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="addAmount">Amount to Add</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="addAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="pl-7 h-11 sm:h-9"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-11 sm:h-9"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gradient-primary text-white h-11 sm:h-9">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Allocate Funds
            </Button>
          </div>
        </form>
    </ResponsiveModal>
  );
}
