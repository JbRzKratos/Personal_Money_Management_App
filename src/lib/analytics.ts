import { 
  BankAccountSerialized, 
  TransactionSerialized, 
  SavingsGoalSerialized,
  DashboardStats,
  MonthlyChartData,
  FinancialInsight
} from "@/types";
import { startOfMonth, subMonths, format, isAfter, isBefore } from "date-fns";

export function computeDashboardStats(
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
    } else if (
      (isAfter(tDate, lastMonthStart) || tDate.getTime() === lastMonthStart.getTime()) &&
      isBefore(tDate, currentMonthStart)
    ) {
      if (t.transactionType === "INCOME") lastMonthlyIncome += t.amount;
      if (t.transactionType === "EXPENSE") lastMonthlyExpenses += t.amount;
    }
  });

  const incomeChange = lastMonthlyIncome === 0 ? 100 : ((currentMonthlyIncome - lastMonthlyIncome) / lastMonthlyIncome) * 100;
  const expenseChange = lastMonthlyExpenses === 0 ? 100 : ((currentMonthlyExpenses - lastMonthlyExpenses) / lastMonthlyExpenses) * 100;
  // Approximation for savings change (we could track this more accurately if needed)
  const savingsChange = 0; 

  return {
    totalBalance,
    totalSavings,
    monthlyIncome: currentMonthlyIncome,
    monthlyExpenses: currentMonthlyExpenses,
    incomeChange,
    expenseChange,
    savingsChange
  };
}

export function computeMonthlyChartData(transactions: TransactionSerialized[]): MonthlyChartData[] {
  const now = new Date();
  const data: MonthlyChartData[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthName = format(monthStart, "MMM yyyy");
    const nextMonthStart = i === 0 ? new Date() : startOfMonth(subMonths(now, i - 1));

    let income = 0;
    let expenses = 0;

    transactions.forEach((t) => {
      const tDate = new Date(t.transactionDate);
      if ((isAfter(tDate, monthStart) || tDate.getTime() === monthStart.getTime()) && isBefore(tDate, nextMonthStart)) {
        if (t.transactionType === "INCOME") income += t.amount;
        if (t.transactionType === "EXPENSE") expenses += t.amount;
      }
    });

    data.push({
      month: monthName,
      income,
      expenses,
      savings: income - expenses
    });
  }

  return data;
}

export function computeInsights(stats: DashboardStats): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  
  if (stats.monthlyExpenses > stats.monthlyIncome) {
    insights.push({
      id: "1",
      message: "Your expenses exceed your income this month. Consider reviewing your budget.",
      type: "warning",
      icon: "TrendingDown"
    });
  }

  if (stats.incomeChange > 10) {
    insights.push({
      id: "2",
      message: "Great job! Your income increased by more than 10% compared to last month.",
      type: "positive",
      icon: "TrendingUp"
    });
  }

  if (stats.expenseChange < -10 && stats.monthlyExpenses > 0) {
    insights.push({
      id: "3",
      message: "You've successfully reduced your expenses by over 10% this month.",
      type: "positive",
      icon: "ArrowUpRight"
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "4",
      message: "Your finances look stable this month. Keep up the good work!",
      type: "neutral",
      icon: "Activity"
    });
  }

  return insights;
}
