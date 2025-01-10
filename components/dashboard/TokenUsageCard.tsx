import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenDisplay, formatCurrency } from './TokenDisplay';
import { getPricing, calculateCost } from '@/utils/pricing';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { plans } from './PlanSelector';

interface TokenUsage {
  userTokens: number;
  assistantTokens: number;
}

interface MonthlyData {
  [modelName: string]: TokenUsage;
}

interface TokenUsageCardProps {
  month: string;
  data: MonthlyData;
  selectedPlan: string;
}

const isAfterOrEqual = (date1: string, date2: string) => {
  const [month1, year1] = date1.split('-');
  const [month2, year2] = date2.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (year1 > year2) return true;
  if (year1 === year2) return months.indexOf(month1) >= months.indexOf(month2);
  return false;
};

export const TokenUsageCard: React.FC<TokenUsageCardProps> = ({ month, data, selectedPlan }) => {
  let totalCost = 0;

  Object.entries(data).forEach(([modelName, usage]) => {
    const pricing = getPricing(modelName);
    const inputCost = calculateCost(usage.userTokens, pricing.inputCost);
    const outputCost = calculateCost(usage.assistantTokens, pricing.outputCost);
    totalCost += inputCost + outputCost;
  });

  const selectedPlanDetails = plans.find(plan => plan.value === selectedPlan) || plans[0];
  const isWorthIt = totalCost > selectedPlanDetails.price;
  const shouldDisplayMessage = isAfterOrEqual(month, selectedPlanDetails.releaseDate);

  return (
    <Card className="w-full bg-white/10 backdrop-filter backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-black dark:text-white relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl" />
      {shouldDisplayMessage && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-2 right-2 flex items-center">
                <span className={`mr-2 text-sm font-semibold ${isWorthIt ? 'text-green-500' : 'text-blue-500'}`}>
                  {isWorthIt ? 'Worth it!' : 'Tip!'}
                </span>
                <div 
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    ${isWorthIt ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-blue-400 to-indigo-600'}
                    shadow-md transform transition-transform duration-300 hover:scale-110
                  `}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" className="max-w-xs z-50">
              <div className={`p-3 rounded-lg ${isWorthIt ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                {isWorthIt ? (
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Your usage justifies a {selectedPlanDetails.name} subscription. It is a worthy investment for your level of interaction!
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Your current usage is relatively low for the {selectedPlanDetails.name} plan. Consider a lower tier or exploring API options for potentially lower costs.
                    </p>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">{month}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 mb-2 text-sm font-semibold">
          <div>Model Name</div>
          <div className="text-center">Input</div>
          <div className="text-center">Output</div>
          <div className="text-right">Total</div>
        </div>
        {Object.entries(data).map(([modelName, usage]) => {
          const pricing = getPricing(modelName);
          const inputCost = calculateCost(usage.userTokens, pricing.inputCost);
          const outputCost = calculateCost(usage.assistantTokens, pricing.outputCost);
          const modelTotalCost = inputCost + outputCost;

          return (
            <div key={modelName} className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 py-2 border-t border-white/20">
              <div className="font-medium">{modelName}</div>
              <div className="text-center">
                <TokenDisplay value={usage.userTokens} cost={inputCost} />
              </div>
              <div className="text-center">
                <TokenDisplay value={usage.assistantTokens} cost={outputCost} />
              </div>
              <div className="text-right">
                <TokenDisplay 
                  value={usage.userTokens + usage.assistantTokens} 
                  cost={modelTotalCost}
                />
              </div>
            </div>
          );
        })}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
          <div className="font-semibold">Total Cost:</div>
          <div className="text-xl font-bold">{formatCurrency(totalCost)}</div>
        </div>
      </CardContent>
    </Card>
  );
};