"use client";

import { useFinanceStore } from "@/stores/finance-store";
import { AccountCard } from "@/components/accounts/account-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ClientAccountCreate } from "./client-account-create";

function AccountsList() {
  const { accounts } = useFinanceStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="mt-8">
        <ClientAccountCreate>
          <EmptyState
            icon={Wallet}
            title="No bank accounts found"
            description="Get started by creating your first bank account or wallet to track your money."
            actionLabel="Create Account"
          />
        </ClientAccountCreate>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6 animate-fade-in stagger-children">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}

export default function AccountsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="page-title">Bank Accounts</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
            Manage your bank accounts, wallets, and cash balances.
          </p>
        </div>
        <ClientAccountCreate>
          <Button className="gradient-primary text-white shadow-md shadow-primary/25">
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </ClientAccountCreate>
      </div>
      <AccountsList />
    </div>
  );
}
