import Link from "next/link";
import { ArrowRight, Shield, PieChart, Wallet, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">FinanceFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-32 z-10 animate-fade-in">
        <div className="text-center max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border text-sm font-medium mx-auto mb-4">
            <Sparkles className="h-4 w-4" />
            <span>The smart way to manage your money locally</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Take Control of Your <br className="hidden sm:block" />
            Financial Future
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your expenses, set intelligent savings goals, and gain crystal-clear insights into your spending habits with our secure, offline-first dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md text-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Launch App
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mt-16 sm:mt-32 w-full stagger-children">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center text-center gap-3 sm:gap-4">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Visual Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">
              Understand where your money goes with clear, interactive charts and categorised breakdowns.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center text-center gap-3 sm:gap-4">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Smart Budgeting</h3>
            <p className="text-muted-foreground leading-relaxed">
              Create multiple bank accounts, track sub-categories, and easily transfer funds between them.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center text-center gap-3 sm:gap-4 sm:col-span-2 md:col-span-1">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">100% Private</h3>
            <p className="text-muted-foreground leading-relaxed">
              All your financial data stays completely offline and secure on your local device. No backend required.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Wallet className="h-4 w-4" />
            <span className="font-semibold tracking-tight text-sm">FinanceFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FinanceFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
