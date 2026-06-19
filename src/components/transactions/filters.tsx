"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, SlidersHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

export function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "ALL";
  const currentSearch = searchParams.get("search") || "";
  const currentDateFrom = searchParams.get("from") || "";
  const currentDateTo = searchParams.get("to") || "";

  const [search, setSearch] = useState(currentSearch);
  const [type, setType] = useState(currentType);
  const [dateFrom, setDateFrom] = useState(currentDateFrom);
  const [dateTo, setDateTo] = useState(currentDateTo);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) params.set("search", search);
    else params.delete("search");
    
    if (type && type !== "ALL") params.set("type", type);
    else params.delete("type");
    
    if (dateFrom) params.set("from", dateFrom);
    else params.delete("from");
    
    if (dateTo) params.set("to", dateTo);
    else params.delete("to");
    
    params.delete("page"); // Reset pagination on new filter
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setType("ALL");
    setDateFrom("");
    setDateTo("");
    router.push(pathname);
  };

  const hasActiveFilters = currentSearch || currentType !== "ALL" || currentDateFrom || currentDateTo;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="pr-8"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              const params = new URLSearchParams(searchParams.toString());
              params.delete("search");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">Filters</h4>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">From Date</label>
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">To Date</label>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
                placeholder="Select end date"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                Clear
              </Button>
              <Button className="w-full" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button 
        variant="secondary" 
        className="sm:hidden"
        onClick={applyFilters}
      >
        Search
      </Button>
    </div>
  );
}
