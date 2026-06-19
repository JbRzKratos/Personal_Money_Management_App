"use client";

import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { TransactionDisplay } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, ArrowRight as ArrowRightIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentTransactionsProps {
  transactions: TransactionDisplay[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card className="border border-border col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ArrowRightIcon}
            title="No transactions yet"
            description="Your recent transactions will appear here."
          />
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return (
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        );
      case "EXPENSE":
        return (
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        );
      case "TRANSFER":
        return (
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500">
            <ArrowRight className="h-4 w-4" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border border-border col-span-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-4 pr-2">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 overflow-hidden">
                {getTypeIcon(t.transactionType)}
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">
                    {t.accountName}
                    {t.note ? ` - ${t.note}` : ""}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {formatDateTime(t.transactionDate)}
                    <span className="mx-1">•</span>
                    {t.transactionType === "TRANSFER"
                      ? `${t.fromCategoryName} → ${t.toCategoryName}`
                      : t.transactionType === "INCOME"
                      ? t.toCategoryName
                      : t.fromCategoryName}
                  </span>
                </div>
              </div>
              <div
                className={`font-semibold text-sm whitespace-nowrap pl-2 ${
                  t.transactionType === "INCOME"
                    ? "text-green-600 dark:text-green-500"
                    : t.transactionType === "EXPENSE"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {t.transactionType === "INCOME" ? "+" : ""}
                {t.transactionType === "EXPENSE" ? "-" : ""}
                {formatCurrency(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
