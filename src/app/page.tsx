"use client";

import Link from "next/link";
import { ArrowRight, Shield, PieChart, Wallet, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/20 via-primary/5 to-background pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full border-b border-border/50 backdrop-blur-md bg-background/50 sticky top-0 z-50">
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
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 z-10">
        <motion.div 
          className="text-center max-w-3xl space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mx-auto mb-4">
            <Sparkles className="h-4 w-4" />
            <span>The smart way to manage your money locally</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Take Control of Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Financial Future
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your expenses, set intelligent savings goals, and gain crystal-clear insights into your spending habits with our secure, offline-first dashboard.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Launch Simulator
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Visual Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">
              Understand where your money goes with beautiful, interactive charts and categorised breakdowns.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Smart Budgeting</h3>
            <p className="text-muted-foreground leading-relaxed">
              Create multiple bank accounts, track sub-categories, and easily transfer funds between them.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">100% Private</h3>
            <p className="text-muted-foreground leading-relaxed">
              All your financial data stays completely offline and secure on your local device. No backend required.
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Wallet className="h-4 w-4" />
            <span className="font-semibold tracking-tight text-sm">FinanceFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FinanceFlow Local MVP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
