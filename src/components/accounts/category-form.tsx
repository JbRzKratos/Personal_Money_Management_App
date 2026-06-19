"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AccountCategorySerialized } from "@/types";
import {
  categoryCreateSchema,
  categoryEditSchema,
  type CategoryCreateInput,
  type CategoryEditInput,
} from "@/lib/validations";

interface CategoryFormProps {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AccountCategorySerialized | null;
}

export function CategoryForm({
  accountId,
  open,
  onOpenChange,
  initialData,
}: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addCategory, updateCategory } = useFinanceStore();
  const isEditing = !!initialData;

  const createForm = useForm<CategoryCreateInput>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      categoryName: "",
    },
  });

  const editForm = useForm<CategoryEditInput>({
    resolver: zodResolver(categoryEditSchema),
    defaultValues: {
      categoryName: initialData?.categoryName || "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      createForm.reset();
      editForm.reset();
    }
    onOpenChange(newOpen);
  };

  const onCreateSubmit = async (data: CategoryCreateInput) => {
    setIsLoading(true);
    try {
      addCategory(accountId, {
        categoryName: data.categoryName,
      });
      toast.success("Category created successfully");
      handleOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onEditSubmit = async (data: CategoryEditInput) => {
    setIsLoading(true);
    try {
      if (initialData) {
        updateCategory(accountId, initialData.id, { categoryName: data.categoryName });
        toast.success("Category updated successfully");
      }
      handleOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your category name below."
              : "Add a new category to segment this account's money."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g. Travel Fund"
                {...editForm.register("categoryName")}
              />
              {editForm.formState.errors.categoryName && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.categoryName.message}
                </p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-primary text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g. Travel Fund"
                {...createForm.register("categoryName")}
              />
              {createForm.formState.errors.categoryName && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.categoryName.message}
                </p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-primary text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Category
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
