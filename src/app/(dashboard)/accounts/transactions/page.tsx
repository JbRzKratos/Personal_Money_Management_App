"use client";

import Link from "next/link";
import { useFinanceStore } from "@/stores/finance-store";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionFilters } from "@/components/transactions/filters";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { useMounted, useFilteredTransactions } from "@/hooks";

function AccountTransactionsContent({ accountId }: { accountId: string }) {
  const isMounted = useMounted();
  const searchParams = useSearchParams();
  const { accounts } = useFinanceStore();

  const account = accounts.find((a) => a.id === accountId);

  if (isMounted && !account) {
    notFound();
  }

  const page = parseInt(searchParams.get("page") || "1");
  const type = searchParams.get("type") as "ALL" | "INCOME" | "EXPENSE" | "TRANSFER" | null;
  const search = searchParams.get("search");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const { paginatedTransactions, totalPages } = useFilteredTransactions({
    page,
    accountId,
    transactionType: type || undefined,
    search: search || undefined,
    dateFrom: from || undefined,
    dateTo: to || undefined,
  });

  if (!isMounted || !account) {
    return <TableSkeleton rows={10} />;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <Link
          href={`/accounts/detail?id=${accountId}`}
          className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors w-fit"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {account.accountName}
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Activity</h1>
          <p className="text-muted-foreground mt-1">
            Transaction history for {account.accountName}.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
        <TransactionFilters />
      </div>

      <div className="animate-fade-in">
        <TransactionTable transactions={paginatedTransactions as any} />
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </>
  );
}

function AccountTransactionsPageInner() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("id") || "";

  return <AccountTransactionsContent accountId={accountId} />;
}

export default function AccountTransactionsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Suspense fallback={<TableSkeleton rows={10} />}>
        <AccountTransactionsPageInner />
      </Suspense>
    </div>
  );
}
