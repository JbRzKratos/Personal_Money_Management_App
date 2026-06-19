"use client";

import { useState, cloneElement, isValidElement } from "react";
import { AccountForm } from "@/components/accounts/account-form";

interface ClientAccountCreateProps {
  children: React.ReactNode;
}

export function ClientAccountCreate({ children }: ClientAccountCreateProps) {
  const [isOpen, setIsOpen] = useState(false);

  // If children is a valid React element, we can attach the onClick handler to it.
  // Otherwise, wrap it in a div that handles the click.
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
      <AccountForm open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
