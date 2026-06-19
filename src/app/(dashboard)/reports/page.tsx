"use client";

import { useFinanceStore } from "@/stores/finance-store";
import { ReportCard } from "@/components/reports/report-card";
import { ReportGenerator } from "@/components/reports/report-generator";
import { EmptyState } from "@/components/shared/empty-state";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

function ReportsList() {
  const { reports } = useFinanceStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={FileText}
          title="No reports generated yet"
          description="Generate your first monthly report to snapshot your income, expenses, and savings for a specific month."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 animate-fade-in stagger-children">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and export monthly financial snapshots.
          </p>
        </div>
        <ReportGenerator />
      </div>

      <ReportsList />
    </div>
  );
}
