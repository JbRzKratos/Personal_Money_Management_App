"use client";

import { useState, cloneElement, isValidElement } from "react";
import { SubGoalForm } from "@/components/budget/sub-goal-form";

interface ClientSubGoalCreateProps {
  goalId: string;
  children: React.ReactNode;
}

export function ClientSubGoalCreate({ goalId, children }: ClientSubGoalCreateProps) {
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
      <SubGoalForm goalId={goalId} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
