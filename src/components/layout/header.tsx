"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sun,
  Moon,
  User,
  Plus,
  ArrowLeftRight,
  Sparkles,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { TransactionForm } from "@/components/transactions/transaction-form";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

export function Header({ userName = "User", userEmail = "" }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 h-14 sm:h-16 border-b border-border bg-background/80 backdrop-blur-xl safe-area-top">
        <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6">
          {/* Left: Logo on mobile, empty on desktop (sidebar has logo) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="gradient-primary rounded-lg p-1.5 flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">FinanceFlow</span>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            {/* Empty spacer on desktop since sidebar provides branding */}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Actions - desktop only */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
              onClick={() => setTransactionOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Transaction</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
              onClick={() => setTransferOpen(true)}
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>Transfer</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full h-9 w-9"
            >
              <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full"
                >
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm font-semibold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Transaction & Transfer Modals */}
      <TransactionForm
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
        defaultType="EXPENSE"
      />
      <TransactionForm
        open={transferOpen}
        onOpenChange={setTransferOpen}
        defaultType="TRANSFER"
      />
    </>
  );
}
