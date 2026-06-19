"use client";

import { useTheme } from "next-themes";
import { formatCurrency } from "@/lib/utils";
import type { CategoryAnalytics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface CategoryChartProps {
  data: CategoryAnalytics[];
  monthName: string;
  year: number;
}

export function CategoryChart({ data, monthName, year }: CategoryChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (data.length === 0) {
    return (
      <Card className="border border-border h-full">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
          <CardDescription>Where your money went in {monthName} {year}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <EmptyState
            icon={PieChartIcon}
            title="No expense data"
            description={`We couldn't find any expenses for ${monthName} ${year}.`}
            className="border-none bg-transparent"
          />
        </CardContent>
      </Card>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-1">{data.name}</p>
          <p className="text-sm font-bold" style={{ color: data.color }}>
            {formatCurrency(data.amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.percentage}% of total expenses
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
        <CardDescription>Where your money went in {monthName} {year}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[300px] lg:h-full w-full">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 100, height: 100 }}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
                stroke={isDark ? "#09090b" : "#ffffff"}
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ 
                  fontSize: '12px', 
                  color: isDark ? '#a1a1aa' : '#71717a',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
                formatter={(value: any, entry: any, index: number) => {
                  const payload = (entry as any).payload;
                  return <span className="font-medium">{value} ({payload.percentage}%)</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
