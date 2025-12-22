import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TokenDisplayProps {
  value: number;
  cost: number;
  align?: "start" | "center" | "end";
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ value, cost, align = "center" }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="text-left">
        <div className="font-medium">{formatNumber(value)}</div>
        <div className="text-xs text-black dark:text-gray-300">{formatCurrency(cost)}</div>
      </TooltipTrigger>
      <TooltipContent 
        side="top"
        align={align}
        className="max-w-[200px] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold">{value.toLocaleString()} tokens</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{formatCurrency(cost)}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export { formatNumber, formatCurrency };
