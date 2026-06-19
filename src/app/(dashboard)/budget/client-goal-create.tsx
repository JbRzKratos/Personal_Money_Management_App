"use client";

import { useState, cloneElement, isValidElement } from "react";
import { GoalForm } from "@/components/budget/goal-form";

interface ClientGoalCreateProps {
  children: React.ReactNode;
}

export function ClientGoalCreate({ children }: ClientGoalCreateProps) {
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
      <GoalForm open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
