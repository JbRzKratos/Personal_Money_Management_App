"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDateTime, calculatePercentage } from "@/lib/utils";
import type { SavingsGoalSerialized } from "@/types";
import { useFinanceStore } from "@/stores/finance-store";
import { GoalForm } from "./goal-form";
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
import { Target, MoreVertical, Edit2, Trash2, ArrowRight, CalendarIcon, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { AddMoneyModal } from "./add-money-modal";

interface GoalCardProps {
  goal: SavingsGoalSerialized;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteGoal } = useFinanceStore();

  const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
  
  let daysRemaining = null;
  if (goal.targetDate) {
    const today = new Date();
    const target = new Date(goal.targetDate);
    daysRemaining = differenceInDays(target, today);
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      deleteGoal(goal.id);
      toast.success("Goal deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="stat-card group relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
        
        <CardContent className="p-0 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                  {goal.goalName}
                </h3>
                {daysRemaining !== null && daysRemaining > 0 && (
                  <div className="flex items-center text-[10px] text-muted-foreground mt-1">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {daysRemaining} days left
                  </div>
                )}
                {daysRemaining !== null && daysRemaining <= 0 && percentage < 100 && (
                  <div className="flex items-center text-[10px] text-destructive mt-1">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Overdue
                  </div>
                )}
                {percentage >= 100 && (
                  <div className="flex items-center text-[10px] text-green-600 dark:text-green-500 mt-1">
                    <Target className="h-3 w-3 mr-1" />
                    Goal Reached!
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit goal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                <span className="text-muted-foreground">of {formatCurrency(goal.targetAmount)}</span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2" 
                indicatorClassName={percentage >= 100 ? "bg-green-500" : "bg-primary"}
              />
              <p className="text-right text-xs text-muted-foreground mt-1">
                {percentage}% completed
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              {goal.subGoalsCount} Sub-goals
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsAddMoneyOpen(true)}
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 px-2.5 border-primary/20 hover:border-primary text-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <PlusCircle className="h-3 w-3" />
                Add Money
              </Button>
              <Link href={`/budget/${goal.id}`}>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 hover:bg-primary/10 hover:text-primary transition-colors">
                  Manage
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <GoalForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={goal}
      />

      <AddMoneyModal
        open={isAddMoneyOpen}
        onOpenChange={setIsAddMoneyOpen}
        goal={goal}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Goal"
        description="Are you sure you want to delete this savings goal? All its sub-goals will also be permanently deleted. This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete Goal"}
        variant="destructive"
      />
    </>
  );
}
