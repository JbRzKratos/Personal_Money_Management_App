"use client";

import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import { SubGoalCard } from "@/components/budget/sub-goal-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus, Target, CalendarIcon } from "lucide-react";
import { ClientSubGoalCreate } from "./client-sub-goal-create";
import { differenceInDays } from "date-fns";
import { useFinanceStore } from "@/stores/finance-store";
import { useEffect, useState, Suspense } from "react";
import { CardSkeleton } from "@/components/shared/loading-skeleton";

function GoalDetailContent() {
  const searchParams = useSearchParams();
  const goalId = searchParams.get("id") || "";
  const { goals } = useFinanceStore();

  const goal = goals.find((g) => g.id === goalId);

  if (!goal) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        Failed to load goal: Goal not found
      </div>
    );
  }

  const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
  const isCompleted = percentage >= 100;
  
  let daysRemaining = null;
  if (goal.targetDate) {
    const today = new Date();
    const target = new Date(goal.targetDate);
    daysRemaining = differenceInDays(target, today);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col gap-4">
        <Link
          href="/budget"
          className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors w-fit"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to goals
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-border pb-6">
          <div className="flex-1 w-full max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500">
                <Target className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{goal.goalName}</h1>
            </div>
            
            {goal.description && (
              <p className="text-muted-foreground mt-2 mb-4">
                {goal.description}
              </p>
            )}

            <div className="space-y-2 mt-6 bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Progress</p>
                  <p className="text-3xl font-bold tracking-tight text-primary">
                    {formatCurrency(goal.currentAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Target</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              </div>
              
              <Progress 
                value={percentage} 
                className="h-3" 
                indicatorClassName={isCompleted ? "bg-green-500" : "bg-primary"}
              />
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium">
                    {percentage}% <span className="text-muted-foreground font-normal">reached</span>
                  </p>
                  {isCompleted && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500 rounded-full font-medium">
                      Goal Achieved!
                    </span>
                  )}
                </div>
                
                {daysRemaining !== null && (
                  <div className={`text-sm font-medium flex items-center ${
                    daysRemaining < 0 && !isCompleted ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    <CalendarIcon className="h-4 w-4 mr-1.5" />
                    {daysRemaining < 0 && !isCompleted
                      ? `${Math.abs(daysRemaining)} days overdue`
                      : `${daysRemaining} days left`}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <ClientSubGoalCreate goalId={goal.id}>
              <Button className="gradient-primary text-white w-full shadow-md shadow-primary/25">
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </ClientSubGoalCreate>
          </div>
        </div>
      </div>

      {/* Sub-Goals Grid */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Milestones
        </h2>
        
        {goal.subGoals.length === 0 ? (
          <ClientSubGoalCreate goalId={goal.id}>
            <EmptyState
              icon={Target}
              title="No milestones yet"
              description="Break this goal down into smaller, achievable steps to stay motivated."
              actionLabel="Create Milestone"
            />
          </ClientSubGoalCreate>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in stagger-children">
            {goal.subGoals.map((subGoal) => (
              <SubGoalCard key={subGoal.id} subGoal={subGoal} goalId={goal.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoalDetailPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 border-b border-border pb-6">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 border-b border-border pb-6">
          <CardSkeleton />
        </div>
      </div>
    }>
      <GoalDetailContent />
    </Suspense>
  );
}
