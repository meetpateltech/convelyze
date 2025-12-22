import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from 'lucide-react'
import { formatNumber } from './TokenDisplay';

interface SummaryCardProps {
  title: string;
  data: { input: number | string; output: number | string; total: number | string };
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, data }) => {
  const tooltipContent = title === 'Tokens' 
  ? (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-50">
        <Info className="h-3.5 w-3.5 text-teal-500" />
        <span>Token Estimation</span>
      </div>
      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Tokens are estimated using a heuristic method (approx. 4 characters per token). 
        Actual count may vary from OpenAI&apos;s tokenizer.
      </p>
    </div>
  )
  : (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-50">
        <Info className="h-3.5 w-3.5 text-teal-500" />
        <span>Cost Calculation</span>
      </div>
      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Calculated using the latest{' '}
        <a 
          href="https://openai.com/pricing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-teal-500 hover:text-teal-400 underline font-medium"
        >
          OpenAI pricing
        </a>
        . Includes only text-based tokens (excludes attached media cost).
      </p>
    </div>
  );

  return (
    <Card className="w-full bg-white/10 backdrop-filter backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-black dark:text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 text-muted-foreground hover:text-teal-500 transition-colors cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              align="end" 
              className="max-w-[280px] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-semibold">Input</div>
            <div className="text-lg font-bold">{typeof data.input === 'number' ? formatNumber(data.input) : data.input}</div>
          </div>
          <div>
            <div className="text-sm font-semibold">Output</div>
            <div className="text-lg font-bold">{typeof data.output === 'number' ? formatNumber(data.output) : data.output}</div>
          </div>
          <div>
            <div className="text-sm font-semibold">Total</div>
            <div className="text-lg font-bold">{typeof data.total === 'number' ? formatNumber(data.total) : data.total}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};