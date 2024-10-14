import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TokenDisplayProps {
  value: number;
  cost: number;
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

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ value, cost }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="text-left">
        <div className="font-medium">{formatNumber(value)}</div>
        <div className="text-xs text-black dark:text-gray-300">{formatCurrency(cost)}</div>
      </TooltipTrigger>
      <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg dark:bg-gray-900">
        <p>{value.toLocaleString()} tokens</p>
        <p>{formatCurrency(cost)}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export { formatNumber, formatCurrency };