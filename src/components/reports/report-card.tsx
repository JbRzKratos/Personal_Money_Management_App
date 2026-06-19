"use client";

import { useState } from "react";
import { formatCurrency, getMonthName } from "@/lib/utils";
import type { MonthlyReportSerialized, TransactionDisplay } from "@/types";
import { useFinanceStore } from "@/stores/finance-store";
import { exportMonthlyReportPDF, exportMonthlyReportExcel } from "@/lib/export";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreVertical, Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportCardProps {
  report: MonthlyReportSerialized;
}

export function ReportCard({ report }: ReportCardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const monthName = getMonthName(report.month);

  const { transactions, accounts } = useFinanceStore();

  const getReportTransactions = (): TransactionDisplay[] => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.transactionDate);
      return tDate.getMonth() + 1 === report.month && tDate.getFullYear() === report.year;
    });

    return monthTransactions.map((t) => {
      let accountName = "Unknown Account";
      let fromCategoryName = "Unknown";
      let toCategoryName = "Unknown";

      if (t.accountId) {
        const acc = accounts.find((a) => a.id === t.accountId);
        if (acc) {
          accountName = acc.accountName;
          if (t.fromCategoryId) {
            fromCategoryName = acc.categories.find(c => c.id === t.fromCategoryId)?.categoryName || "Unknown";
          }
          if (t.toCategoryId) {
            toCategoryName = acc.categories.find(c => c.id === t.toCategoryId)?.categoryName || "Unknown";
          }
        }
      } else if (t.transactionType === "TRANSFER") {
        accountName = "Transfer";
        for (const acc of accounts) {
          if (!fromCategoryName || fromCategoryName === "Unknown") {
            const fromCat = acc.categories.find(c => c.id === t.fromCategoryId);
            if (fromCat) fromCategoryName = fromCat.categoryName;
          }
          if (!toCategoryName || toCategoryName === "Unknown") {
            const toCat = acc.categories.find(c => c.id === t.toCategoryId);
            if (toCat) toCategoryName = toCat.categoryName;
          }
        }
      }

      return {
        ...t,
        accountName,
        fromCategoryName,
        toCategoryName,
      };
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportTransactions = getReportTransactions();
      if (reportTransactions.length > 0) {
        exportMonthlyReportPDF(report, reportTransactions);
        toast.success("PDF Exported successfully");
      } else {
        toast.error("No transactions found for this month");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const reportTransactions = getReportTransactions();
      if (reportTransactions.length > 0) {
        exportMonthlyReportExcel(report, reportTransactions);
        toast.success("Excel Exported successfully");
      } else {
        toast.error("No transactions found for this month");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="stat-card group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
      
      <CardContent className="p-0 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {monthName} {report.year}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monthly Snapshot
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                Export As
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileJson className="mr-2 h-4 w-4 text-red-500" />
                PDF Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                Excel Spreadsheet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Income</span>
            <span className="font-medium text-green-600 dark:text-green-500">
              {formatCurrency(report.income)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Expenses</span>
            <span className="font-medium">
              {formatCurrency(report.expenses)}
            </span>
          </div>
          <div className="pt-3 border-t border-border flex justify-between items-center">
            <span className="font-medium">Net Savings</span>
            <span className={`font-bold tracking-tight ${report.savings >= 0 ? "text-primary" : "text-destructive"}`}>
              {report.savings > 0 ? "+" : ""}{formatCurrency(report.savings)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
