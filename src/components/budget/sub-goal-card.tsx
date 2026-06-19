"use client";

import { useState } from "react";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import type { SubGoalSerialized } from "@/types";
import { useFinanceStore } from "@/stores/finance-store";
import { SubGoalForm } from "./sub-goal-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit2, Trash2, CheckCircle2, Circle, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { AddMoneyModal } from "./add-money-modal";

interface SubGoalCardProps {
  subGoal: SubGoalSerialized;
  goalId: string;
}

export function SubGoalCard({ subGoal, goalId }: SubGoalCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSubGoal } = useFinanceStore();

  const percentage = calculatePercentage(subGoal.currentAmount, subGoal.targetAmount);
  const isCompleted = percentage >= 100;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      deleteSubGoal(goalId, subGoal.id);
      toast.success("Sub-goal deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="stat-card border border-border group relative overflow-visible">
        <CardContent className="p-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary text-foreground">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-medium text-sm truncate max-w-[150px]">
                {subGoal.subGoalName}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2">
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit milestone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete milestone
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between text-xs font-medium">
              <span>{formatCurrency(subGoal.currentAmount)}</span>
              <span className="text-muted-foreground">{formatCurrency(subGoal.targetAmount)}</span>
            </div>
            <Progress 
              value={percentage} 
              className="h-1.5" 
              indicatorClassName={isCompleted ? "bg-green-500" : "bg-primary"}
            />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
              {isCompleted ? (
                <p className="text-[10px] text-green-600 dark:text-green-500 font-medium">
                  Milestone Reached!
                </p>
              ) : (
                <span />
              )}
              <Button
                onClick={() => setIsAddMoneyOpen(true)}
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] gap-1 px-2 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <PlusCircle className="h-3 w-3" />
                Add Money
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SubGoalForm
        goalId={subGoal.goalId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={subGoal}
      />

      <AddMoneyModal
        open={isAddMoneyOpen}
        onOpenChange={setIsAddMoneyOpen}
        subGoal={subGoal}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Milestone"
        description="Are you sure you want to delete this sub-goal? Your main goal progress won't be affected, but this milestone will be lost."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete Milestone"}
        variant="destructive"
      />
    </>
  );
}
