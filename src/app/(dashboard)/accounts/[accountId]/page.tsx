"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { CategoryCard } from "@/components/accounts/category-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Tag, Activity } from "lucide-react";
import { ClientCategoryCreate } from "./client-category-create";
import { useFinanceStore } from "@/stores/finance-store";
import { use } from "react";
import { useEffect, useState } from "react";
import { CardSkeleton } from "@/components/shared/loading-skeleton";

interface AccountPageProps {
  params: Promise<{
    accountId: string;
  }>;
}

export default function AccountDetailPage({ params }: AccountPageProps) {
  const { accountId } = use(params);
  const { accounts } = useFinanceStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 border-b border-border pb-6">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const account = accounts.find(a => a.id === accountId);

  if (!account) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        Failed to load account: Account not found
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <Link
          href="/accounts"
          className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors w-fit"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to accounts
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{account.accountName}</h1>
            {account.description && (
              <p className="text-muted-foreground mt-1 max-w-2xl">
                {account.description}
              </p>
            )}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-4xl font-bold tracking-tight text-primary mt-1">
                {formatCurrency(account.totalBalance)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/transactions`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                View Activity
              </Button>
            </Link>
            <ClientCategoryCreate accountId={account.id}>
              <Button className="gradient-primary text-white w-full sm:w-auto shadow-md shadow-primary/25">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </ClientCategoryCreate>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Sub-Balances / Categories
        </h2>
        
        {account.categories.length === 0 ? (
          <ClientCategoryCreate accountId={account.id}>
            <EmptyState
              icon={Tag}
              title="No categories yet"
              description="Categories help you divide your account balance into different buckets (like Savings, Rent, or Travel fund)."
              actionLabel="Create First Category"
            />
          </ClientCategoryCreate>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in stagger-children">
            {account.categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                accountTotal={account.totalBalance} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
