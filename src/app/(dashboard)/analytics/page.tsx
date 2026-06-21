"use client";

import { Suspense } from "react";
import { CategoryChart } from "@/components/analytics/category-chart";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { getMonthName } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useMounted, useDashboardStats } from "@/hooks";
import { useFinanceStore } from "@/stores/finance-store";
import { ReportService } from "@/services/report.service";
import { useMemo } from "react";

function AnalyticsContent() {
  const isMounted = useMounted();
  const searchParams = useSearchParams();

  const today = new Date();
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  const month = monthParam ? parseInt(monthParam) : today.getMonth() + 1;
  const year = yearParam ? parseInt(yearParam) : today.getFullYear();

  const { chartData: monthlyTrendData } = useDashboardStats();
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const categoryData = useMemo(
    () => ReportService.computeCategoryAnalytics(transactions, accounts, month, year),
    [transactions, accounts, month, year]
  );

  if (!isMounted) {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
          <div className="lg:col-span-4 h-fit lg:h-[400px]">
            <CardSkeleton />
          </div>
          <div className="lg:col-span-3 h-fit lg:h-[400px]">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
            Deep dive into your financial trends and habits.
          </p>
        </div>
        
        <AnalyticsFilters />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4 h-fit lg:h-[400px]">
          <IncomeExpenseChart data={monthlyTrendData} />
        </div>
        <div className="lg:col-span-3 h-fit lg:h-[400px]">
          <CategoryChart 
            data={categoryData} 
            monthName={getMonthName(month)} 
            year={year} 
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
          <div className="lg:col-span-4 h-fit lg:h-[400px]">
            <CardSkeleton />
          </div>
          <div className="lg:col-span-3 h-fit lg:h-[400px]">
            <CardSkeleton />
          </div>
        </div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
