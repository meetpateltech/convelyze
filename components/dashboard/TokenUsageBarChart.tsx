/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from './TokenDisplay'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TokenUsage {
  userTokens: number;
  assistantTokens: number;
}

interface MonthlyData {
  [modelName: string]: TokenUsage;
}

interface TokenUsageData {
  [month: string]: MonthlyData;
}

interface TokenUsageBarChartProps {
  data: TokenUsageData;
  year: number;
  onYearChange: (year: number) => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Custom Tooltip with Color Indicator
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 min-w-[150px]">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  {entry.name}
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                {formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function TokenUsageBarChart({ data, year, onYearChange }: TokenUsageBarChartProps) {
  const chartData = months.map(month => {
    const monthKey = `${month}-${year.toString().slice(-2)}`;
    const monthData = data[monthKey] || {};
    
    return {
      month,
      input: Object.values(monthData).reduce((sum, usage) => sum + usage.userTokens, 0),
      output: Object.values(monthData).reduce((sum, usage) => sum + usage.assistantTokens, 0),
    };
  });

  const availableYears = Array.from(new Set(Object.keys(data).map(key => parseInt(key.split('-')[1]) + 2000)));

  return (
    <Card className="w-full bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">Monthly Token Usage</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Input and Output Tokens per Month</CardDescription>
        </div>
        <Select value={year.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                stroke="#888" 
                tick={{ fill: '#888' }} 
                axisLine={{ stroke: '#444' }}
              />
              <YAxis 
                stroke="#888" 
                tick={{ fill: '#888' }} 
                axisLine={{ stroke: '#444' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#000' }}
                payload={[
                  { value: 'Input', type: 'square', color: '#D63A6A' },
                  { value: 'Output', type: 'square', color: '#2562D9' },
                ]}
              />
              <Bar dataKey="input" stackId="a" fill="#D63A6A" name="Input" radius={[4, 4, 0, 0]} />
              <Bar dataKey="output" stackId="a" fill="#2562D9" name="Output" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}