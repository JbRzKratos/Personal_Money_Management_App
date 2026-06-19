"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subGoalSchema, type SubGoalInput } from "@/lib/validations";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import type { SubGoalSerialized } from "@/types";

interface SubGoalFormProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SubGoalSerialized | null;
}

export function SubGoalForm({
  goalId,
  open,
  onOpenChange,
  initialData,
}: SubGoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addSubGoal, updateSubGoal } = useFinanceStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubGoalInput>({
    resolver: zodResolver(subGoalSchema),
    defaultValues: {
      subGoalName: initialData?.subGoalName || "",
      targetAmount: initialData?.targetAmount || 0,
      currentAmount: initialData?.currentAmount || 0,
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: SubGoalInput) => {
    setIsLoading(true);
    try {
      if (initialData) {
        updateSubGoal(initialData.id, data);
      } else {
        addSubGoal(goalId, data);
      }

      toast.success(
        initialData
          ? "Sub-goal updated successfully"
          : "Sub-goal created successfully"
      );
      handleOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {initialData ? "Edit Sub-goal" : "Create New Sub-goal"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update this milestone's details."
              : "Break your main goal into smaller, manageable milestones."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="subGoalName">Milestone Name</Label>
            <Input
              id="subGoalName"
              placeholder="e.g. Save first $1000"
              {...register("subGoalName")}
            />
            {errors.subGoalName && (
              <p className="text-xs text-destructive">
                {errors.subGoalName.message}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min="1"
                placeholder="0.00"
                {...register("targetAmount", { valueAsNumber: true })}
              />
              {errors.targetAmount && (
                <p className="text-xs text-destructive">
                  {errors.targetAmount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Amount</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("currentAmount", { valueAsNumber: true })}
              />
              {errors.currentAmount && (
                <p className="text-xs text-destructive">
                  {errors.currentAmount.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gradient-primary text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Save Changes" : "Create Sub-goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
