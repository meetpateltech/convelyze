import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Plan {
  name: string;
  value: string;
  price: number;
  releaseDate: string;
}

export const plans: Plan[] = [
  { name: "Free", value: "free", price: 0, releaseDate: "Nov-22" },
  { name: "Plus", value: "plus", price: 20, releaseDate: "Feb-23" },
  { name: "Team", value: "team", price: 25, releaseDate: "Jan-24" },
  { name: "Pro", value: "pro", price: 200, releaseDate: "Dec-24" },
];

const planColors: Record<string, string> = {
  free: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  plus: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  team: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  pro: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
};

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ selectedPlan, onPlanChange }) => {
  const currentPlan = plans.find(p => p.value === selectedPlan);

  return (
    <Select value={selectedPlan} onValueChange={onPlanChange}>
      <SelectTrigger className="w-[180px] h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
        <SelectValue>
          <div className="flex items-center justify-between w-full pr-2">
            <span className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide rounded-sm border ${planColors[selectedPlan]}`}>
              {currentPlan?.name}
            </span>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">
              ${currentPlan?.price}
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal ml-0.5">/mo</span>
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[180px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg p-1">
        {plans.map((plan) => (
          <SelectItem 
            key={plan.value} 
            value={plan.value} 
            className="rounded-sm py-2 px-2 focus:bg-zinc-100 dark:focus:bg-zinc-900 cursor-pointer my-0.5"
          >
            <div className="flex items-center justify-between w-full gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-sm border ${planColors[plan.value]}`}>
                {plan.name}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 tabular-nums">
                ${plan.price}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
