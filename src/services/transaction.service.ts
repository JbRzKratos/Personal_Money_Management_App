/**
 * TransactionService — Transaction creation, deletion, and balance side-effects.
 * 
 * Pure functions. Balance updates on categories are computed here
 * and returned as new state — no mutations.
 */

import { v4 as uuidv4 } from "uuid";
import { TRANSACTION_TYPES } from "@/constants";
import type {
  BankAccountSerialized,
  TransactionSerialized,
  TransactionCreatePayload,
  TransactionDisplay,
} from "@/types";

export const TransactionService = {
  /**
   * Create a transaction and apply balance side-effects to accounts.
   */
  createTransaction(
    accounts: BankAccountSerialized[],
    transactions: TransactionSerialized[],
    payload: TransactionCreatePayload
  ): { accounts: BankAccountSerialized[]; transactions: TransactionSerialized[] } {
    const now = new Date().toISOString();

    const newTransaction: TransactionSerialized = {
      ...payload,
      id: uuidv4(),
      createdAt: now,
    };

    const updatedAccounts = this.applyBalanceChange(accounts, payload, "apply");

    return {
      accounts: updatedAccounts,
      transactions: [newTransaction, ...transactions],
    };
  },

  /**
   * Delete a transaction and reverse its balance side-effects.
   */
  deleteTransaction(
    accounts: BankAccountSerialized[],
    transactions: TransactionSerialized[],
    transactionId: string
  ): { accounts: BankAccountSerialized[]; transactions: TransactionSerialized[] } {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return { accounts, transactions };

    const updatedAccounts = this.applyBalanceChange(accounts, tx, "reverse");

    return {
      accounts: updatedAccounts,
      transactions: transactions.filter((t) => t.id !== transactionId),
    };
  },

  /**
   * Apply or reverse balance changes on accounts/categories.
   */
  applyBalanceChange(
    accounts: BankAccountSerialized[],
    tx: TransactionCreatePayload | TransactionSerialized,
    direction: "apply" | "reverse"
  ): BankAccountSerialized[] {
    const multiplier = direction === "apply" ? 1 : -1;

    return accounts.map((acc) => {
      // For transfers, categories might span different accounts
      const isRelevantAccount =
        acc.id === tx.accountId ||
        acc.categories.some(
          (c) => c.id === tx.fromCategoryId || c.id === tx.toCategoryId
        );

      if (!isRelevantAccount) return acc;

      const updatedCategories = acc.categories.map((cat) => {
        let balanceDelta = 0;

        if (
          (tx.transactionType === TRANSACTION_TYPES.INCOME ||
            tx.transactionType === TRANSACTION_TYPES.INITIAL_BALANCE) &&
          cat.id === tx.toCategoryId
        ) {
          balanceDelta = tx.amount * multiplier;
        } else if (
          tx.transactionType === TRANSACTION_TYPES.EXPENSE &&
          cat.id === tx.fromCategoryId
        ) {
          balanceDelta = -(tx.amount * multiplier);
        } else if (tx.transactionType === TRANSACTION_TYPES.TRANSFER) {
          if (cat.id === tx.fromCategoryId) {
            balanceDelta = -(tx.amount * multiplier);
          }
          if (cat.id === tx.toCategoryId) {
            balanceDelta += tx.amount * multiplier;
          }
        }

        if (balanceDelta === 0) return cat;

        return {
          ...cat,
          currentBalance: cat.currentBalance + balanceDelta,
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        ...acc,
        categories: updatedCategories,
        totalBalance: updatedCategories.reduce((sum, c) => sum + c.currentBalance, 0),
        updatedAt: new Date().toISOString(),
      };
    });
  },

  /**
   * Enrich raw transactions with human-readable account/category names.
   * This is a display-only transformation — never stored.
   */
  enrichTransactions(
    transactions: TransactionSerialized[],
    accounts: BankAccountSerialized[]
  ): TransactionDisplay[] {
    return transactions.map((t) => {
      let accountName = "Unknown Account";
      let fromCategoryName: string | null = null;
      let toCategoryName: string | null = null;

      if (t.accountId) {
        const acc = accounts.find((a) => a.id === t.accountId);
        if (acc) {
          accountName = acc.accountName;
          if (t.fromCategoryId) {
            const cat = acc.categories.find((c) => c.id === t.fromCategoryId);
            if (cat) fromCategoryName = cat.categoryName;
          }
          if (t.toCategoryId) {
            const cat = acc.categories.find((c) => c.id === t.toCategoryId);
            if (cat) toCategoryName = cat.categoryName;
          }
        }
      }

      // For transfers, categories may be in different accounts
      if (t.transactionType === TRANSACTION_TYPES.TRANSFER) {
        if (!t.accountId) accountName = "Transfer";
        accounts.forEach((acc) => {
          if (!fromCategoryName && t.fromCategoryId) {
            const cat = acc.categories.find((c) => c.id === t.fromCategoryId);
            if (cat) fromCategoryName = cat.categoryName;
          }
          if (!toCategoryName && t.toCategoryId) {
            const cat = acc.categories.find((c) => c.id === t.toCategoryId);
            if (cat) toCategoryName = cat.categoryName;
          }
        });
      }

      return {
        ...t,
        accountName,
        fromCategoryName,
        toCategoryName,
      };
    });
  },
};
