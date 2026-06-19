"use client";

import { useTheme } from "next-themes";
import { formatCurrency } from "@/lib/utils";
import type { ChartDataPoint } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BalanceChartProps {
  data: ChartDataPoint[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  const { theme } = useTheme();
  
  const isDark = theme === "dark";
  const textColor = isDark ? "#a1a1aa" : "#71717a";
  const gridColor = isDark ? "#27272a" : "#e4e4e7";

  return (
    <Card className="border border-border col-span-1 lg:col-span-2 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Total Balance Trend</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[300px] lg:h-full w-full">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 100, height: 100 }}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis 
                dataKey="date" 
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
                contentStyle={{ 
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: isDark ? '#f4f4f5' : '#09090b'
                }}
                formatter={(value: any) => [formatCurrency(Number(value) || 0), "Balance"]}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
