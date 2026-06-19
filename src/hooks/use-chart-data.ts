import { useMemo } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { ReportService } from "@/services/report.service";
import { getMonthName } from "@/lib/utils";
import type { CategoryAnalytics, MonthlyChartData } from "@/types";

/**
 * Memoized chart data for analytics page.
 */
export function useChartData(month: number, year: number) {
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);

  const categoryData = useMemo(
    () => ReportService.computeCategoryAnalytics(transactions, accounts, month, year),
    [transactions, accounts, month, year]
  );

  const monthlyTrendData = useMemo(() => {
    const data: MonthlyChartData[] = [];

    for (let i = 5; i >= 0; i--) {
      let targetMonth = month - i;
      let targetYear = year;

      if (targetMonth <= 0) {
        targetMonth += 12;
        targetYear -= 1;
      }

      let income = 0;
      let expenses = 0;

      transactions.forEach((t) => {
        const d = new Date(t.transactionDate);
        if (d.getMonth() + 1 === targetMonth && d.getFullYear() === targetYear) {
          if (t.transactionType === "INCOME") income += t.amount;
          if (t.transactionType === "EXPENSE") expenses += t.amount;
        }
      });

      data.push({
        month: getMonthName(targetMonth).substring(0, 3),
        income,
        expenses,
        savings: income - expenses,
      });
    }

    return data;
  }, [transactions, month, year]);

  return { categoryData, monthlyTrendData };
}
