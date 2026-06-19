"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { BankAccountSerialized } from "@/types";
import { useFinanceStore } from "@/stores/finance-store";
import { AccountForm } from "./account-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, MoreVertical, Edit2, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface AccountCardProps {
  account: BankAccountSerialized;
}

export function AccountCard({ account }: AccountCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteAccount } = useFinanceStore();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      deleteAccount(account.id);
      toast.success("Account deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="stat-card group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <CardContent className="p-0 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                  {account.accountName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {account.categoryCount} Categories
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight">
              {formatCurrency(account.totalBalance)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              Updated {formatDateTime(account.updatedAt)}
            </p>
            <Link href={`/accounts/detail?id=${account.id}`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 hover:bg-primary/10 hover:text-primary transition-colors">
                View Details
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <AccountForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={account}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Account"
        description="Are you sure you want to delete this account? All associated categories and transactions will be permanently deleted. This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete Account"}
        variant="destructive"
      />
    </>
  );
}
