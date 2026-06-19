"use client";

import { useState, cloneElement, isValidElement } from "react";
import { CategoryForm } from "@/components/accounts/category-form";

interface ClientCategoryCreateProps {
  accountId: string;
  children: React.ReactNode;
}

export function ClientCategoryCreate({ accountId, children }: ClientCategoryCreateProps) {
  const [isOpen, setIsOpen] = useState(false);

  const trigger = isValidElement(children) ? (
    cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
      },
    })
  ) : (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(true);
      }} 
      className="cursor-pointer inline-block"
    >
      {children}
    </div>
  );

  return (
    <>
      {trigger}
      <CategoryForm accountId={accountId} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
