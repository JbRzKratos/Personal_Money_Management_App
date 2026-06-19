"use client";

import { useFinanceStore } from "@/stores/finance-store";
import { useDashboardStats, useMounted } from "@/hooks";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { BalanceChart } from "@/components/dashboard/balance-chart";
import { QuickTransfer } from "@/components/transactions/quick-transfer";
import { Sparkles, TrendingUp, TrendingDown, ArrowLeftRight, Activity } from "lucide-react";
import { useMemo } from "react";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { TransactionService } from "@/services";

function DashboardOverview() {
  const { transactions, accounts } = useFinanceStore();
  const isMounted = useMounted();
  const { stats, chartData, insights, balanceChartData } = useDashboardStats();

  const recentTransactions = useMemo(
    () => {
      const sorted = [...transactions]
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 5);
      return TransactionService.enrichTransactions(sorted, accounts);
    },
    [transactions, accounts]
  );

  if (!isMounted) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2"><CardSkeleton /></div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <StatsCards stats={stats} />

      {insights.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Financial Insights</h4>
            <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              {insights.map((insight) => {
                const getIcon = () => {
                  switch (insight.icon) {
                    case 'TrendingUp': return <TrendingUp className="h-4 w-4 text-green-500" />;
                    case 'TrendingDown': return <TrendingDown className="h-4 w-4 text-destructive" />;
                    case 'ArrowUpRight': return <TrendingUp className="h-4 w-4 text-destructive" />;
                    case 'ArrowLeftRight': return <ArrowLeftRight className="h-4 w-4 text-primary" />;
                    default: return <Activity className="h-4 w-4 text-primary" />;
                  }
                };
                
                return (
                  <div key={insight.id} className="flex items-center gap-1.5">
                    {getIcon()}
                    <span>{insight.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <BalanceChart data={balanceChartData} />
        <div className="flex flex-col gap-4 sm:gap-6">
          <QuickTransfer />
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <IncomeExpenseChart data={chartData} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
            Here&apos;s an overview of your financial health.
          </p>
        </div>
      </div>
      <DashboardOverview />
    </div>
  );
}
