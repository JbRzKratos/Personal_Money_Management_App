import { useMemo } from "react";
import { useFinanceStore } from "@/stores/finance-store";
import { TransactionService } from "@/services/transaction.service";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import type { TransactionDisplay, TransactionFilters, TransactionSerialized } from "@/types";

interface UseFilteredTransactionsResult {
  transactions: TransactionDisplay[];
  paginatedTransactions: TransactionDisplay[];
  totalPages: number;
  totalItems: number;
}

/**
 * Memoized filtered + paginated + enriched transactions.
 * Replaces duplicated useMemo blocks across transaction pages.
 */
export function useFilteredTransactions(
  filters: TransactionFilters
): UseFilteredTransactionsResult {
  const rawTransactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);

  const { search, transactionType, accountId, dateFrom, dateTo, page = 1, pageSize = DEFAULT_PAGE_SIZE } = filters;

  const enrichedAndFiltered = useMemo(() => {
    // Filter lazily — no upfront array copy
    let filtered = rawTransactions as TransactionSerialized[];

    if (accountId) {
      filtered = filtered.filter((t) => t.accountId === accountId);
    }

    if (transactionType && transactionType !== "ALL") {
      filtered = filtered.filter((t) => t.transactionType === transactionType);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((t) => new Date(t.transactionDate) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.transactionDate) <= toDate);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.note && t.note.toLowerCase().includes(lowerSearch)) ||
          t.amount.toString().includes(lowerSearch)
      );
    }

    // Sort by date descending
    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );

    // Enrich with display names
    return TransactionService.enrichTransactions(sorted, accounts);
  }, [rawTransactions, accounts, accountId, transactionType, search, dateFrom, dateTo]);


  const totalItems = enrichedAndFiltered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));

  const paginatedTransactions = useMemo(
    () => enrichedAndFiltered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [enrichedAndFiltered, safePage, pageSize]
  );

  return {
    transactions: enrichedAndFiltered,
    paginatedTransactions,
    totalPages,
    totalItems,
  };
}
