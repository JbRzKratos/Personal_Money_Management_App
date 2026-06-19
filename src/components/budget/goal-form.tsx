"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/components/ui/date-picker";
import { goalSchema, type GoalInput } from "@/lib/validations";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Target, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import type { SavingsGoalSerialized } from "@/types";
import { format } from "date-fns";

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SavingsGoalSerialized | null;
}

export function GoalForm({ open, onOpenChange, initialData }: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addGoal, updateGoal } = useFinanceStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalName: initialData?.goalName || "",
      description: initialData?.description || "",
      targetAmount: initialData?.targetAmount || 0,
      currentAmount: initialData?.currentAmount || 0,
      targetDate: initialData?.targetDate 
        ? format(new Date(initialData.targetDate), "yyyy-MM-dd") 
        : "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: GoalInput) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        description: data.description || null,
        targetDate: data.targetDate || null,
        goalType: "PERMANENT" as const,
        parentId: null,
      };

      if (initialData) {
        updateGoal(initialData.id, payload);
      } else {
        addGoal(payload);
      }

      toast.success(
        initialData ? "Goal updated successfully" : "Goal created successfully"
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
            <Target className="h-5 w-5 text-primary" />
            {initialData ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update your savings goal details below."
              : "Set a new savings target to track your progress."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="goalName">Goal Name</Label>
            <Input
              id="goalName"
              placeholder="e.g. New Car Fund"
              {...register("goalName")}
            />
            {errors.goalName && (
              <p className="text-xs text-destructive">
                {errors.goalName.message}
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
              <Label htmlFor="currentAmount">Current Saved</Label>
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

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (Optional)</Label>
            <Controller
              control={control}
              name="targetDate"
              render={({ field }) => (
                <DatePicker
                  value={field.value || undefined}
                  onChange={field.onChange}
                  placeholder="Select target date"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What are you saving for?"
              {...register("description")}
              className="resize-none"
            />
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
              {initialData ? "Save Changes" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
