"use client";

import { useState } from "react";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import type { AccountCategorySerialized } from "@/types";
import { useFinanceStore } from "@/stores/finance-store";
import { CategoryForm } from "./category-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

interface CategoryCardProps {
  category: AccountCategorySerialized;
  accountTotal: number;
}

export function CategoryCard({ category, accountTotal }: CategoryCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { deleteCategory } = useFinanceStore();

  const percentage = calculatePercentage(
    Math.abs(category.currentBalance),
    Math.abs(accountTotal) || 1
  );

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      deleteCategory(category.accountId, category.id);
      toast.success("Category deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="stat-card border border-border group relative overflow-visible">
        <CardContent className="p-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary text-foreground">
                <Tag className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-sm truncate max-w-[150px]">
                {category.categoryName}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2">
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit name
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-4">
            <p className="text-xl font-bold tracking-tight">
              {formatCurrency(category.currentBalance)}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{percentage}% of Account</span>
            </div>
            <Progress value={percentage} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <CategoryForm
        accountId={category.accountId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={category}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Category"
        description="Are you sure you want to delete this category? Any transactions associated with this category will have their category references removed but the transaction records will remain."
        onConfirm={handleDelete}
        confirmText={isProcessing ? "Deleting..." : "Delete Category"}
        variant="destructive"
      />
    </>
  );
}
