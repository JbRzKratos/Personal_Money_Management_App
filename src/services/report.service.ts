/**
 * ReportService — Report generation and analytics computations.
 * 
 * Absorbs logic from lib/analytics.ts. Pure functions only.
 */

import { v4 as uuidv4 } from "uuid";
import { startOfMonth, subMonths, format, isAfter, isBefore } from "date-fns";
import { CHART_COLORS } from "@/constants";
import type {
  BankAccountSerialized,
  TransactionSerialized,
  SavingsGoalSerialized,
  MonthlyReportSerialized,
  DashboardStats,
  MonthlyChartData,
  FinancialInsight,
  CategoryAnalytics,
} from "@/types";

export const ReportService = {
  computeDashboardStats(
    accounts: BankAccountSerialized[],
    transactions: TransactionSerialized[],
    goals: SavingsGoalSerialized[]
  ): DashboardStats {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.totalBalance, 0);
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = subMonths(currentMonthStart, 1);

    let currentMonthlyIncome = 0;
    let currentMonthlyExpenses = 0;
    let lastMonthlyIncome = 0;
    let lastMonthlyExpenses = 0;

    transactions.forEach((t) => {
      const tDate = new Date(t.transactionDate);
      if (isAfter(tDate, currentMonthStart) || tDate.getTime() === currentMonthStart.getTime()) {
        if (t.transactionType === "INCOME") currentMonthlyIncome += t.amount;
        if (t.transactionType === "EXPENSE") currentMonthlyExpenses += t.amount;
        if (t.transactionType === "TRANSFER" && t.toCategoryId === null) currentMonthlyIncome -= t.amount;
      } else if (
        (isAfter(tDate, lastMonthStart) || tDate.getTime() === lastMonthStart.getTime()) &&
        isBefore(tDate, currentMonthStart)
      ) {
        if (t.transactionType === "INCOME") lastMonthlyIncome += t.amount;
        if (t.transactionType === "EXPENSE") lastMonthlyExpenses += t.amount;
        if (t.transactionType === "TRANSFER" && t.toCategoryId === null) lastMonthlyIncome -= t.amount;
      }
    });

    const incomeChange =
      lastMonthlyIncome === 0
        ? 100
        : ((currentMonthlyIncome - lastMonthlyIncome) / lastMonthlyIncome) * 100;
    const expenseChange =
      lastMonthlyExpenses === 0
        ? 100
        : ((currentMonthlyExpenses - lastMonthlyExpenses) / lastMonthlyExpenses) * 100;

    return {
      totalBalance,
      totalSavings,
      monthlyIncome: currentMonthlyIncome,
      monthlyExpenses: currentMonthlyExpenses,
      incomeChange,
      expenseChange,
      savingsChange: 0,
    };
  },

  computeMonthlyChartData(transactions: TransactionSerialized[]): MonthlyChartData[] {
    const now = new Date();
    // Build the 6 month buckets we care about
    const buckets = new Map<string, { label: string; income: number; expenses: number }>();
    for (let i = 5; i >= 0; i--) {
      const key = format(startOfMonth(subMonths(now, i)), "yyyy-MM");
      const label = format(startOfMonth(subMonths(now, i)), "MMM yyyy");
      buckets.set(key, { label, income: 0, expenses: 0 });
    }

    // Single pass — O(n) instead of O(6n)
    for (const t of transactions) {
      const key = t.transactionDate.slice(0, 7); // "yyyy-MM"
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (t.transactionType === "INCOME") bucket.income += t.amount;
      else if (t.transactionType === "EXPENSE") bucket.expenses += t.amount;
      else if (t.transactionType === "TRANSFER" && t.toCategoryId === null) bucket.income -= t.amount;
    }

    return Array.from(buckets.values()).map((b) => ({
      month: b.label,
      income: b.income,
      expenses: b.expenses,
      savings: b.income - b.expenses,
    }));
  },

  computeInsights(stats: DashboardStats): FinancialInsight[] {
    const insights: FinancialInsight[] = [];

    if (stats.monthlyExpenses > stats.monthlyIncome) {
      insights.push({
        id: "1",
        message: "Your expenses exceed your income this month. Consider reviewing your budget.",
        type: "warning",
        icon: "TrendingDown",
      });
    }

    if (stats.incomeChange > 10) {
      insights.push({
        id: "2",
        message: "Great job! Your income increased by more than 10% compared to last month.",
        type: "positive",
        icon: "TrendingUp",
      });
    }

    if (stats.expenseChange < -10 && stats.monthlyExpenses > 0) {
      insights.push({
        id: "3",
        message: "You've successfully reduced your expenses by over 10% this month.",
        type: "positive",
        icon: "ArrowUpRight",
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: "4",
        message: "Your finances look stable this month. Keep up the good work!",
        type: "neutral",
        icon: "Activity",
      });
    }

    return insights;
  },

  computeCategoryAnalytics(
    transactions: TransactionSerialized[],
    accounts: BankAccountSerialized[],
    month: number,
    year: number
  ): CategoryAnalytics[] {
    const expensesMap = new Map<string, number>();
    let totalExpenses = 0;

    const monthTransactions = transactions.filter((t) => {
      if (t.transactionType !== "EXPENSE") return false;
      const d = new Date(t.transactionDate);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    monthTransactions.forEach((t) => {
      let categoryName = "Uncategorized";

      if (t.accountId && t.fromCategoryId) {
        const acc = accounts.find((a) => a.id === t.accountId);
        if (acc) {
          const cat = acc.categories.find((c) => c.id === t.fromCategoryId);
          if (cat) categoryName = cat.categoryName;
        }
      }

      expensesMap.set(categoryName, (expensesMap.get(categoryName) || 0) + t.amount);
      totalExpenses += t.amount;
    });

    const result: CategoryAnalytics[] = [];
    let colorIndex = 0;

    expensesMap.forEach((amount, name) => {
      result.push({
        name,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
        color: CHART_COLORS[colorIndex % CHART_COLORS.length],
      });
      colorIndex++;
    });

    return result.sort((a, b) => b.amount - a.amount);
  },

  generateMonthlyReport(
    transactions: TransactionSerialized[],
    month: number,
    year: number
  ): MonthlyReportSerialized {
    let income = 0;
    let expenses = 0;

    transactions.forEach((t) => {
      const tDate = new Date(t.transactionDate);
      if (tDate.getMonth() + 1 === month && tDate.getFullYear() === year) {
        const amt = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
        if (!isNaN(amt)) {
          if (t.transactionType === "INCOME") income += amt;
          else if (t.transactionType === "EXPENSE") expenses += amt;
        }
      }
    });

    return {
      id: uuidv4(),
      month,
      year,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      savings: Math.round((income - expenses) * 100) / 100,
      createdAt: new Date().toISOString(),
    };
  },
};
