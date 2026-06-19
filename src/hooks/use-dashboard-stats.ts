import { useMemo } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { ReportService } from "@/services/report.service";
import type { DashboardStats, MonthlyChartData, FinancialInsight, ChartDataPoint } from "@/types";

/**
 * Memoized dashboard statistics.
 * Only recomputes when accounts, transactions, or goals change.
 */
export function useDashboardStats(): {
  stats: DashboardStats;
  chartData: MonthlyChartData[];
  insights: FinancialInsight[];
  balanceChartData: ChartDataPoint[];
} {
  const accounts = useFinanceStore((s) => s.accounts);
  const transactions = useFinanceStore((s) => s.transactions);
  const goals = useFinanceStore((s) => s.goals);

  const stats = useMemo(
    () => ReportService.computeDashboardStats(accounts, transactions, goals),
    [accounts, transactions, goals]
  );

  const chartData = useMemo(
    () => ReportService.computeMonthlyChartData(transactions),
    [transactions]
  );

  const insights = useMemo(() => ReportService.computeInsights(stats), [stats]);

  const balanceChartData = useMemo(() => {
    let runningBalance = stats.totalBalance;
    return [...chartData]
      .reverse()
      .map((month) => {
        const data: ChartDataPoint = {
          date: month.month,
          balance: runningBalance,
        };
        runningBalance = runningBalance - month.savings;
        return data;
      })
      .reverse();
  }, [chartData, stats.totalBalance]);

  return { stats, chartData, insights, balanceChartData };
}
