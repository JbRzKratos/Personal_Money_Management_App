"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSettingsStore } from "@/stores/settings-store";
import { CURRENCIES } from "@/constants";
import { useFinanceStore } from "@/stores/finance-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Download, Upload, Trash2, Settings2, Wallet, FileJson } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currencyCode, setCurrency } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-hydration check
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExportData = () => {
    try {
      const state = useFinanceStore.getState();
      const exportData = {
        accounts: state.accounts,
        transactions: state.transactions,
        goals: state.goals,
        reports: state.reports,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `financeflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully!");
    } catch (e) {
      toast.error("Failed to export data");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data.accounts || !data.transactions) {
          throw new Error("Invalid backup file format");
        }

        useFinanceStore.setState({
          accounts: data.accounts || [],
          transactions: data.transactions || [],
          goals: data.goals || [],
          reports: data.reports || [],
        });

        toast.success("Data imported successfully!");
        // Refresh the page to ensure all components pick up the new state properly
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast.error("Failed to parse backup file. Please ensure it's a valid JSON backup.");
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    useFinanceStore.getState().resetStore();
    toast.success("All data has been wiped clean");
    setIsResetDialogOpen(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  if (!mounted) {
    return null; // Or a skeleton
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
          Manage your app preferences and data backups.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your app experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Currency Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Display Currency
              </label>
              <Select value={currencyCode} onValueChange={setCurrency}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="font-medium mr-2">{c.symbol}</span> 
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[13px] text-muted-foreground">
                This changes how money values are formatted across the entire app.
              </p>
            </div>

            <div className="border-t border-border my-2" />

            {/* Theme Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Appearance
              </label>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className={theme === "light" ? "bg-primary" : ""}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </Button>
                <Button 
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className={theme === "dark" ? "bg-primary" : ""}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </Button>
                <Button 
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className={theme === "system" ? "bg-primary" : ""}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>
              Export your data for safekeeping, or import a previous backup.
              Since this app runs entirely locally, YOU are responsible for your data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg bg-muted/30 flex flex-col items-start gap-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Download className="w-4 h-4 text-green-500" />
                    Export Backup
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Download all your accounts, transactions, and goals to a JSON file.
                  </p>
                </div>
                <Button onClick={handleExportData} className="mt-auto w-full sm:w-auto">
                  Export to JSON
                </Button>
              </div>

              <div className="p-4 border border-border rounded-lg bg-muted/30 flex flex-col items-start gap-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-500" />
                    Import Backup
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Restore your data from a previously exported JSON backup file.
                  </p>
                </div>
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleImportData} 
                  className="hidden" 
                />
                <Button 
                  variant="secondary" 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-auto w-full sm:w-auto"
                >
                  Choose JSON File
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-destructive/5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
            <div>
              <h3 className="font-medium text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete all data stored in this browser. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)}>
              Wipe All Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ConfirmationDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        title="Wipe All Data?"
        description="This will permanently delete all your accounts, transactions, goals, and reports from this browser. This action cannot be undone. Are you absolutely sure?"
        onConfirm={handleResetData}
        confirmText="Yes, Wipe Everything"
        variant="destructive"
      />
    </div>
  );
}
