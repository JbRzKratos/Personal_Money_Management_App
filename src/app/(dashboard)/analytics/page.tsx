"use client";

import { Suspense } from "react";
import { CategoryChart } from "@/components/analytics/category-chart";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { getMonthName } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useMounted, useChartData } from "@/hooks";

function AnalyticsContent() {
  const isMounted = useMounted();
  const searchParams = useSearchParams();

  const today = new Date();
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  const month = monthParam ? parseInt(monthParam) : today.getMonth() + 1;
  const year = yearParam ? parseInt(yearParam) : today.getFullYear();

  const { categoryData, monthlyTrendData } = useChartData(month, year);

  if (!isMounted) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="md:col-span-1 lg:col-span-4 h-[400px]">
            <CardSkeleton />
          </div>
          <div className="md:col-span-1 lg:col-span-3 h-[400px]">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep dive into your financial trends and habits.
          </p>
        </div>
        
        <AnalyticsFilters />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-1 lg:col-span-4 h-[400px]">
          <IncomeExpenseChart data={monthlyTrendData} />
        </div>
        <div className="md:col-span-1 lg:col-span-3 h-[400px]">
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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="md:col-span-1 lg:col-span-4 h-[400px]">
            <CardSkeleton />
          </div>
          <div className="md:col-span-1 lg:col-span-3 h-[400px]">
            <CardSkeleton />
          </div>
        </div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
