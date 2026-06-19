"use client";

import { useFinanceStore } from "@/stores/finance-store";
import { GoalCard } from "@/components/budget/goal-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientGoalCreate } from "./client-goal-create";
import { useEffect, useState } from "react";

function GoalsList() {
  const { goals } = useFinanceStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="mt-8">
        <ClientGoalCreate>
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            description="Create your first savings goal to start tracking your progress towards a new car, vacation, or emergency fund."
            actionLabel="Create Goal"
          />
        </ClientGoalCreate>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 animate-fade-in stagger-children">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}

export default function BudgetPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set targets and track your progress over time.
          </p>
        </div>
        <ClientGoalCreate>
          <Button className="gradient-primary text-white shadow-md shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </ClientGoalCreate>
      </div>

      <GoalsList />
    </div>
  );
}
