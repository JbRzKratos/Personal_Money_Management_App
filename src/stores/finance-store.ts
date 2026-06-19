/**
 * Finance Store — Thin orchestration layer.
 * 
 * Holds state and delegates all mutations to services.
 * No business logic lives here — only state coordination.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORE_KEYS } from "@/constants";
import { AccountService } from "@/services/account.service";
import { TransactionService } from "@/services/transaction.service";
import { BudgetService } from "@/services/budget.service";
import { ReportService } from "@/services/report.service";
import type {
  BankAccountSerialized,
  TransactionSerialized,
  SavingsGoalSerialized,
  MonthlyReportSerialized,
  AccountCreatePayload,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  TransactionCreatePayload,
  GoalCreatePayload,
  SubGoalCreatePayload,
} from "@/types";

interface FinanceState {
  // ---- Data ----
  accounts: BankAccountSerialized[];
  transactions: TransactionSerialized[];
  goals: SavingsGoalSerialized[];
  reports: MonthlyReportSerialized[];

  // ---- Account Actions ----
  addAccount: (payload: AccountCreatePayload) => void;
  updateAccount: (id: string, data: Partial<Pick<BankAccountSerialized, "accountName" | "description">>) => void;
  deleteAccount: (id: string) => void;

  // ---- Category Actions ----
  addCategory: (accountId: string, payload: CategoryCreatePayload) => void;
  updateCategory: (accountId: string, categoryId: string, data: CategoryUpdatePayload) => void;
  deleteCategory: (accountId: string, categoryId: string) => void;

  // ---- Transaction Actions ----
  addTransaction: (payload: TransactionCreatePayload) => void;
  deleteTransaction: (id: string) => void;

  // ---- Goal Actions ----
  addGoal: (payload: GoalCreatePayload) => void;
  updateGoal: (id: string, data: Partial<Pick<SavingsGoalSerialized, "goalName" | "goalType" | "targetAmount" | "currentAmount" | "targetDate" | "description">>) => void;
  deleteGoal: (id: string) => void;
  addSubGoal: (goalId: string, payload: SubGoalCreatePayload) => void;
  updateSubGoal: (subGoalId: string, data: Partial<Pick<import("@/types").SubGoalSerialized, "subGoalName" | "targetAmount" | "currentAmount">>) => void;
  deleteSubGoal: (goalId: string, subGoalId: string) => void;

  // ---- Report Actions ----
  generateReport: (month: number, year: number) => void;
  deleteReport: (id: string) => void;

  // ---- Utilities ----
  resetStore: () => void;
}

const INITIAL_STATE = {
  accounts: [] as BankAccountSerialized[],
  transactions: [] as TransactionSerialized[],
  goals: [] as SavingsGoalSerialized[],
  reports: [] as MonthlyReportSerialized[],
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ========================
      // ACCOUNTS
      // ========================
      addAccount: (payload) =>
        set((state) => {
          const { account, initialTransaction } = AccountService.createAccount(payload);
          let transactions = state.transactions;
          if (initialTransaction) {
            transactions = [initialTransaction, ...transactions];
          }
          return {
            accounts: [...state.accounts, account],
            transactions,
          };
        }),

      updateAccount: (id, data) =>
        set((state) => ({
          accounts: AccountService.updateAccount(state.accounts, id, data),
        })),

      deleteAccount: (id) =>
        set((state) => {
          const result = AccountService.deleteAccount(state.accounts, state.transactions, id);
          return { accounts: result.accounts, transactions: result.transactions };
        }),

      // ========================
      // CATEGORIES
      // ========================
      addCategory: (accountId, payload) =>
        set((state) => {
          const { category, initialTransaction } = AccountService.createCategory(payload, accountId);
          let accounts = AccountService.addCategoryToAccount(state.accounts, accountId, category);
          let transactions = state.transactions;

          // If there's an initial balance, we don't need to apply balance change
          // because createCategory already set the balance on the category.
          // We just store the transaction for audit trail.
          if (initialTransaction) {
            transactions = [initialTransaction, ...transactions];
          }

          return { accounts, transactions };
        }),

      updateCategory: (accountId, categoryId, data) =>
        set((state) => ({
          accounts: AccountService.updateCategoryName(state.accounts, accountId, categoryId, data),
        })),

      deleteCategory: (accountId, categoryId) =>
        set((state) => {
          const result = AccountService.deleteCategory(state.accounts, state.transactions, accountId, categoryId);
          return { accounts: result.accounts, transactions: result.transactions };
        }),

      // ========================
      // TRANSACTIONS
      // ========================
      addTransaction: (payload) =>
        set((state) => {
          const result = TransactionService.createTransaction(
            state.accounts,
            state.transactions,
            payload
          );
          return { accounts: result.accounts, transactions: result.transactions };
        }),

      deleteTransaction: (id) =>
        set((state) => {
          const result = TransactionService.deleteTransaction(
            state.accounts,
            state.transactions,
            id
          );
          return { accounts: result.accounts, transactions: result.transactions };
        }),

      // ========================
      // GOALS
      // ========================
      addGoal: (payload) =>
        set((state) => ({
          goals: [...state.goals, BudgetService.createGoal(payload)],
        })),

      updateGoal: (id, data) =>
        set((state) => ({
          goals: BudgetService.updateGoal(state.goals, id, data),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: BudgetService.deleteGoal(state.goals, id),
        })),

      addSubGoal: (goalId, payload) =>
        set((state) => {
          const subGoal = BudgetService.createSubGoal(goalId, payload);
          return { goals: BudgetService.addSubGoalToGoal(state.goals, goalId, subGoal) };
        }),

      updateSubGoal: (subGoalId, data) =>
        set((state) => ({
          goals: BudgetService.updateSubGoal(state.goals, subGoalId, data),
        })),

      deleteSubGoal: (goalId, subGoalId) =>
        set((state) => ({
          goals: BudgetService.deleteSubGoal(state.goals, goalId, subGoalId),
        })),

      // ========================
      // REPORTS
      // ========================
      generateReport: (month, year) =>
        set((state) => {
          const newReport = ReportService.generateMonthlyReport(state.transactions, month, year);
          const existingReports = state.reports.filter(
            (r) => !(r.month === month && r.year === year)
          );
          return { reports: [newReport, ...existingReports] };
        }),

      deleteReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== id),
        })),

      // ========================
      // UTILITIES
      // ========================
      resetStore: () => set(INITIAL_STATE),
    }),
    {
      name: STORE_KEYS.FINANCE,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
