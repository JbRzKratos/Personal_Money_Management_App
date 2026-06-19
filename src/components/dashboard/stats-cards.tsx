"use client";

import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Target, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatChange = (change: number, invertColors = false) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    const isNeutral = change === 0;

    let colorClass = "text-muted-foreground";
    if (!isNeutral) {
      if (invertColors) {
        colorClass = isPositive ? "text-destructive" : "text-green-600 dark:text-green-500";
      } else {
        colorClass = isPositive ? "text-green-600 dark:text-green-500" : "text-destructive";
      }
    }

    return (
      <div className={cn("flex items-center text-xs font-medium", colorClass)}>
        {isPositive && <TrendingUp className="mr-1 h-3 w-3" />}
        {isNegative && <TrendingDown className="mr-1 h-3 w-3" />}
        <span>
          {isPositive ? "+" : ""}
          {change}% from last month
        </span>
      </div>
    );
  };

  const cards = [
    {
      title: "Total Balance",
      amount: stats.totalBalance,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: null, // Total balance doesn't have a simple % change in this model
    },
    {
      title: "Total Savings",
      amount: stats.totalSavings,
      icon: Target,
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-600/10",
      change: stats.savingsChange,
    },
    {
      title: "Monthly Income",
      amount: stats.monthlyIncome,
      icon: ArrowDownLeft,
      color: "text-green-600 dark:text-green-500",
      bgColor: "bg-green-600/10",
      change: stats.incomeChange,
    },
    {
      title: "Monthly Expenses",
      amount: stats.monthlyExpenses,
      icon: ArrowUpRight,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      change: stats.expenseChange,
      invertColors: true, // Higher expenses is "bad"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in stagger-children">
      {cards.map((card, i) => (
        <Card key={i} className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {card.title}
              </h3>
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <card.icon className={cn("h-4 w-4", card.color)} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(card.amount)}
              </p>
              {card.change !== null && (
                <div className="h-4">
                  {formatChange(card.change, card.invertColors)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
