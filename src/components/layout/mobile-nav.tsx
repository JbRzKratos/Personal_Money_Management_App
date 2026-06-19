"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Target,
  BarChart3,
  Plus,
} from "lucide-react";
import { TransactionForm } from "@/components/transactions/transaction-form";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight },
  { href: "/budget", label: "Goals", icon: Target },
  { href: "/analytics", label: "Charts", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  const [transactionOpen, setTransactionOpen] = useState(false);

  return (
    <>
      {/* FAB - Floating Action Button for quick transaction */}
      <button
        onClick={() => setTransactionOpen(true)}
        className="fab gradient-primary text-white lg:hidden"
        aria-label="Add Transaction"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1" suppressHydrationWarning>
          {mobileNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors touch-target relative",
                  "w-full max-w-[72px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200",
                  isActive && "bg-primary/12"
                )} suppressHydrationWarning>
                  <item.icon
                    className={cn(
                      "h-[20px] w-[20px] transition-transform",
                      isActive && "scale-105"
                    )}
                  />
                </div>
                <span className={cn(
                  "text-[10px] leading-tight",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Transaction Modal (triggered by FAB) */}
      <TransactionForm
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
        defaultType="EXPENSE"
      />
    </>
  );
}
