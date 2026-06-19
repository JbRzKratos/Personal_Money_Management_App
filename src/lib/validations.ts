import { z } from "zod";

// ============================================
// Account & Category Schemas
// ============================================

export const accountCreateSchema = z.object({
  accountName: z.string().min(1, "Account name is required").max(50, "Account name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  initialBalance: z
    .number({ message: "Amount must be a number" })
    .min(0, "Balance cannot be negative"),
});

export const accountEditSchema = z.object({
  accountName: z.string().min(1, "Account name is required").max(50, "Account name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
});

export const categoryCreateSchema = z.object({
  categoryName: z.string().min(1, "Category name is required").max(50, "Category name is too long"),
});

export const categoryEditSchema = z.object({
  categoryName: z.string().min(1, "Category name is required").max(50, "Category name is too long"),
});

// ============================================
// Transaction Schemas
// ============================================

export const transferSchema = z.object({
  fromCategoryId: z.string().min(1, "Source category is required"),
  toCategoryId: z.string().min(1, "Destination category is required"),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be positive"),
  note: z.string().max(200, "Note is too long").optional(),
  transactionDate: z.string().min(1, "Date is required"),
}).refine((data) => data.fromCategoryId !== data.toCategoryId, {
  message: "Source and destination must be different",
  path: ["toCategoryId"],
});

export const incomeExpenseSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be positive"),
  note: z.string().max(200, "Note is too long").optional(),
  transactionDate: z.string().min(1, "Date is required"),
  transactionType: z.enum(["INCOME", "EXPENSE"]),
});

// ============================================
// Goal Schemas
// ============================================

export const goalSchema = z.object({
  goalName: z.string().min(1, "Goal name is required").max(50, "Goal name is too long"),
  targetAmount: z
    .number({ message: "Amount must be a number" })
    .positive("Target amount must be positive"),
  currentAmount: z
    .number({ message: "Amount must be a number" })
    .min(0, "Amount cannot be negative"),
  targetDate: z.string().optional(),
  description: z.string().max(200, "Description is too long").optional(),
});

export const savingsGoalSchema = z.object({
  goalName: z.string().min(1, "Goal name is required").max(50, "Goal name is too long"),
  goalType: z.enum(["PERMANENT", "ONE_TIME"]),
  targetAmount: z
    .number({ message: "Amount must be a number" })
    .positive("Target amount must be positive"),
  currentAmount: z
    .number({ message: "Amount must be a number" })
    .min(0, "Amount cannot be negative"),
  description: z.string().max(200, "Description is too long").optional(),
  parentId: z.string().optional().nullable(),
});

export const subGoalSchema = z.object({
  subGoalName: z.string().min(1, "Milestone name is required").max(50, "Milestone name is too long"),
  targetAmount: z
    .number({ message: "Amount must be a number" })
    .positive("Target amount must be positive"),
  currentAmount: z
    .number({ message: "Amount must be a number" })
    .min(0, "Amount cannot be negative"),
});

// ============================================
// Inferred Types
// ============================================

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type AccountEditInput = z.infer<typeof accountEditSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryEditInput = z.infer<typeof categoryEditSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type IncomeExpenseInput = z.infer<typeof incomeExpenseSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
export type SubGoalInput = z.infer<typeof subGoalSchema>;
