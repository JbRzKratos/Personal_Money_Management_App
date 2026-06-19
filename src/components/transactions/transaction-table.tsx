"use client";

import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { TransactionDisplay } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, SearchX, Trash2, MoreVertical } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface TransactionTableProps {
  transactions: TransactionDisplay[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No transactions found"
        description="We couldn't find any transactions matching your current filters."
        className="mt-6"
      />
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case "EXPENSE":
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case "TRANSFER":
        return <ArrowRight className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "INCOME":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900">
            Income
          </Badge>
        );
      case "EXPENSE":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">
            Expense
          </Badge>
        );
      case "TRANSFER":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900">
            Transfer
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden mt-6">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id} className="group">
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                {formatDateTime(t.transactionDate)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(t.transactionType)}
                  {getTypeBadge(t.transactionType)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col max-w-[200px] sm:max-w-[300px]">
                  <span className="font-medium text-sm truncate">
                    {t.accountName}
                  </span>
                  {t.note && (
                    <span className="text-xs text-muted-foreground truncate">
                      {t.note}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                  {t.transactionType === "TRANSFER" ? (
                    <>
                      <span className="truncate max-w-[100px]">{t.fromCategoryName}</span>
                      <ArrowRight className="h-3 w-3 flex-shrink-0 mx-1" />
                      <span className="truncate max-w-[100px]">{t.toCategoryName}</span>
                    </>
                  ) : t.transactionType === "INCOME" ? (
                    t.toCategoryName
                  ) : (
                    t.fromCategoryName
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">
                <span
                  className={
                    t.transactionType === "INCOME"
                      ? "text-green-600 dark:text-green-500"
                      : t.transactionType === "EXPENSE"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {t.transactionType === "INCOME" ? "+" : ""}
                  {t.transactionType === "EXPENSE" ? "-" : ""}
                  {formatCurrency(t.amount)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {t.transactionType !== "INITIAL_BALANCE" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => {
                          useFinanceStore.getState().deleteTransaction(t.id);
                          toast.success("Transaction deleted successfully");
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
