"use client";

import { Suspense } from "react";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionFilters } from "@/components/transactions/filters";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { useSearchParams } from "next/navigation";
import { useMounted, useFilteredTransactions } from "@/hooks";

function TransactionList() {
  const isMounted = useMounted();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const type = searchParams.get("type") as "ALL" | "INCOME" | "EXPENSE" | "TRANSFER" | null;
  const search = searchParams.get("search");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const { paginatedTransactions, totalPages } = useFilteredTransactions({
    page,
    transactionType: type || undefined,
    search: search || undefined,
    dateFrom: from || undefined,
    dateTo: to || undefined,
  });

  if (!isMounted) {
    return <TableSkeleton rows={10} />;
  }

  return (
    <div className="animate-fade-in">
      <TransactionTable transactions={paginatedTransactions as any} />
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="page-title">Transactions</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
          View and filter your complete transaction history.
        </p>
      </div>

      <div className="bg-card border border-border p-3 sm:p-4 rounded-xl shadow-sm">
        <Suspense fallback={<div>Loading filters...</div>}>
          <TransactionFilters />
        </Suspense>
      </div>

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <TransactionList />
      </Suspense>
    </div>
  );
}
