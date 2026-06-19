"use client";

import { useTheme } from "next-themes";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyChartData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface IncomeExpenseChartProps {
  data: MonthlyChartData[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { theme } = useTheme();
  
  const isDark = theme === "dark";
  const textColor = isDark ? "#a1a1aa" : "#71717a";
  const gridColor = isDark ? "#27272a" : "#e4e4e7";

  return (
    <Card className="border border-border col-span-1 lg:col-span-2 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Income vs Expenses (6 Months)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[300px] lg:h-full w-full">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 100, height: 100 }}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: textColor, fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: textColor, fontSize: 12 }}
                tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip
                cursor={{ fill: isDark ? '#27272a' : '#f4f4f5' }}
                contentStyle={{ 
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: isDark ? '#f4f4f5' : '#09090b'
                }}
                formatter={(value: any) => [formatCurrency(Number(value) || 0), ""]}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: textColor }}
              />
              <Bar 
                dataKey="income" 
                name="Income" 
                fill="#16a34a" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
              <Bar 
                dataKey="expenses" 
                name="Expenses" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
