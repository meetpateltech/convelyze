/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from './TokenDisplay';
import { getPricing, } from '@/utils/pricing';

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

interface CostLineChartProps {
  data: TokenUsageData;
  year: number;
  onYearChange: (year: number) => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const calculateCost = (tokens: number, costPerMillion: number) => {
  return (tokens / 1000000) * costPerMillion;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        padding: '10px',
        borderRadius: '8px',
        color: '#fff',
      }}>
        <p>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                borderRadius: '2px',
                marginRight: '8px',
              }}
            />
            <p style={{ margin: 0 }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CostLineChart({ data, year, onYearChange }: CostLineChartProps) {
  const chartData = months.map(month => {
    const monthKey = `${month}-${year.toString().slice(-2)}`;
    const monthData = data[monthKey] || {};

    const totalInputCost = Object.entries(monthData).reduce((sum, [modelName, usage]) => {
      const pricing = getPricing(modelName);
      return sum + calculateCost(usage.userTokens, pricing.inputCost);
    }, 0);

    const totalOutputCost = Object.entries(monthData).reduce((sum, [modelName, usage]) => {
      const pricing = getPricing(modelName);
      return sum + calculateCost(usage.assistantTokens, pricing.outputCost);
    }, 0);

    return {
      month,
      inputCost: totalInputCost,
      outputCost: totalOutputCost,
      totalCost: totalInputCost + totalOutputCost,
    };
  });

  const availableYears = Array.from(new Set(Object.keys(data).map(key => parseInt(key.split('-')[1]) + 2000)));

  return (
    <Card className="w-full bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">Monthly Cost</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Input and Output Costs per Month</CardDescription>
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
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#000' }}
                payload={[
                  { value: 'Input Cost', type: 'line', color: '#D63A6A' },
                  { value: 'Output Cost', type: 'line', color: '#2562D9' },
                  { value: 'Total Cost', type: 'line', color: '#4CAF50' },
                ]}
              />
              <Line type="monotone" dataKey="inputCost" stroke="#D63A6A" name="Input Cost" />
              <Line type="monotone" dataKey="outputCost" stroke="#2562D9" name="Output Cost" />
              <Line type="monotone" dataKey="totalCost" stroke="#4CAF50" name="Total Cost" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}