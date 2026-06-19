import type { TransactionType, GoalType } from "@/constants";

// ============================================
// Core Data Models (stored in localStorage)
// ============================================

export interface AccountCategorySerialized {
  id: string;
  accountId: string;
  categoryName: string;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountSerialized {
  id: string;
  accountName: string;
  description: string | null;
  totalBalance: number;
  categoryCount: number;
  categories: AccountCategorySerialized[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSerialized {
  id: string;
  transactionType: TransactionType;
  amount: number;
  note: string | null;
  accountId: string;
  fromCategoryId: string | null;
  toCategoryId: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface SubGoalSerialized {
  id: string;
  goalId: string;
  subGoalName: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalSerialized {
  id: string;
  parentId: string | null;
  goalName: string;
  goalType: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  description: string | null;
  subGoalsCount: number;
  subGoals: SubGoalSerialized[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReportSerialized {
  id: string;
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  createdAt: string;
}

// ============================================
// Create/Update Payloads (what UI sends)
// ============================================

export interface AccountCreatePayload {
  accountName: string;
  description: string | null;
  initialBalance: number;
}

export interface CategoryCreatePayload {
  categoryName: string;
}

export interface CategoryUpdatePayload {
  categoryName: string;
}

export interface TransactionCreatePayload {
  transactionType: TransactionType;
  amount: number;
  note: string | null;
  accountId: string;
  fromCategoryId: string | null;
  toCategoryId: string | null;
  transactionDate: string;
}

export interface GoalCreatePayload {
  goalName: string;
  goalType: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  description: string | null;
  parentId: string | null;
}

export interface SubGoalCreatePayload {
  subGoalName: string;
  targetAmount: number;
  currentAmount: number;
}

// ============================================
// Dashboard & Chart Types
// ============================================

export interface DashboardStats {
  totalBalance: number;
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface ChartDataPoint {
  date: string;
  balance: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface FinancialInsight {
  id: string;
  message: string;
  type: "positive" | "negative" | "neutral" | "warning";
  icon?: string;
}

export interface CategoryAnalytics {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

// ============================================
// Enriched Transaction (for display)
// ============================================

export interface TransactionDisplay extends TransactionSerialized {
  accountName: string;
  fromCategoryName: string | null;
  toCategoryName: string | null;
}

// ============================================
// Filter types
// ============================================

export interface TransactionFilters {
  search?: string;
  transactionType?: TransactionType | "ALL";
  accountId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================
// Action return types
// ============================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
