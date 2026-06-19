/**
 * AccountService — All account and category mutation logic.
 * 
 * Pure functions that take current state and return new state.
 * No side effects, no store coupling — easy to test and swap.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  BankAccountSerialized,
  AccountCategorySerialized,
  AccountCreatePayload,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  TransactionSerialized,
} from "@/types";
import { TRANSACTION_TYPES } from "@/constants";

export const AccountService = {
  createAccount(payload: AccountCreatePayload): {
    account: BankAccountSerialized;
    initialTransaction: TransactionSerialized | null;
  } {
    const now = new Date().toISOString();
    const accountId = uuidv4();
    const initialBalance = payload.initialBalance || 0;
    const categoryId = uuidv4();

    const categories: AccountCategorySerialized[] = [
      {
        id: categoryId,
        accountId,
        categoryName: "General",
        currentBalance: initialBalance,
        createdAt: now,
        updatedAt: now,
      },
    ];

    let initialTransaction: TransactionSerialized | null = null;
    if (initialBalance > 0) {
      initialTransaction = {
        id: uuidv4(),
        transactionType: TRANSACTION_TYPES.INITIAL_BALANCE,
        amount: initialBalance,
        note: `Initial balance for General`,
        accountId,
        fromCategoryId: null,
        toCategoryId: categoryId,
        transactionDate: now,
        createdAt: now,
      };
    }

    const account: BankAccountSerialized = {
      id: accountId,
      accountName: payload.accountName,
      description: payload.description,
      totalBalance: initialBalance,
      categoryCount: categories.length,
      categories,
      createdAt: now,
      updatedAt: now,
    };

    return { account, initialTransaction };
  },

  updateAccount(
    accounts: BankAccountSerialized[],
    accountId: string,
    data: Partial<Pick<BankAccountSerialized, "accountName" | "description">>
  ): BankAccountSerialized[] {
    return accounts.map((acc) =>
      acc.id === accountId
        ? { ...acc, ...data, updatedAt: new Date().toISOString() }
        : acc
    );
  },

  deleteAccount(
    accounts: BankAccountSerialized[],
    transactions: TransactionSerialized[],
    accountId: string
  ): { accounts: BankAccountSerialized[]; transactions: TransactionSerialized[] } {
    return {
      accounts: accounts.filter((acc) => acc.id !== accountId),
      transactions: transactions.filter((t) => t.accountId !== accountId),
    };
  },

  createCategory(
    payload: CategoryCreatePayload,
    accountId: string
  ): { category: AccountCategorySerialized; initialTransaction: TransactionSerialized | null } {
    const now = new Date().toISOString();
    const categoryId = uuidv4();

    const category: AccountCategorySerialized = {
      id: categoryId,
      accountId,
      categoryName: payload.categoryName,
      currentBalance: 0,
      createdAt: now,
      updatedAt: now,
    };

    return { category, initialTransaction: null };
  },

  addCategoryToAccount(
    accounts: BankAccountSerialized[],
    accountId: string,
    category: AccountCategorySerialized
  ): BankAccountSerialized[] {
    return accounts.map((acc) => {
      if (acc.id !== accountId) return acc;
      const newCategories = [...acc.categories, category];
      return {
        ...acc,
        categories: newCategories,
        categoryCount: newCategories.length,
        totalBalance: newCategories.reduce((sum, c) => sum + c.currentBalance, 0),
        updatedAt: new Date().toISOString(),
      };
    });
  },

  updateCategoryName(
    accounts: BankAccountSerialized[],
    accountId: string,
    categoryId: string,
    data: CategoryUpdatePayload
  ): BankAccountSerialized[] {
    return accounts.map((acc) => {
      if (acc.id !== accountId) return acc;
      return {
        ...acc,
        categories: acc.categories.map((c) =>
          c.id === categoryId
            ? { ...c, categoryName: data.categoryName, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    });
  },

  deleteCategory(
    accounts: BankAccountSerialized[],
    transactions: TransactionSerialized[],
    accountId: string,
    categoryId: string
  ): { accounts: BankAccountSerialized[]; transactions: TransactionSerialized[] } {
    const newAccounts = accounts.map((acc) => {
      if (acc.id !== accountId) return acc;
      const categories = acc.categories.filter((c) => c.id !== categoryId);
      return {
        ...acc,
        categories,
        categoryCount: categories.length,
        totalBalance: categories.reduce((sum, c) => sum + c.currentBalance, 0),
      };
    });

    const newTransactions = transactions.filter(
      (t) => t.fromCategoryId !== categoryId && t.toCategoryId !== categoryId
    );

    return { accounts: newAccounts, transactions: newTransactions };
  },

  /** Recalculate account totals from category balances */
  recalculateAccountTotals(accounts: BankAccountSerialized[]): BankAccountSerialized[] {
    return accounts.map((acc) => ({
      ...acc,
      totalBalance: acc.categories.reduce((sum, c) => sum + c.currentBalance, 0),
    }));
  },
};
