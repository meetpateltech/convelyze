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
    <>
      Tokens are estimated using a heuristic method (approximately 4 characters per token). 
      Actual token count may vary from OpenAI&apos;s tokenizer.
    </>
  )
  : (
    <>
      Cost calculated using the latest{' '}
      <a 
        href="https://openai.com/pricing" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        OpenAI pricing
      </a>
      . Includes only text-based tokens (excludes attached media cost).
    </>
  );

  return (
    <Card className="w-full bg-white/10 backdrop-filter backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-black dark:text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              align="end" 
              className="max-w-xs bg-gray-800 text-white p-2 rounded-md shadow-lg border border-gray-700"
            >
              <p className="text-xs">{tooltipContent}</p>
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