import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Plan {
  name: string;
  value: string;
  price: number;
  releaseDate: string;
}

export const plans: Plan[] = [
  { name: "Free ($0/month)", value: "free", price: 0, releaseDate: "Nov-22" },
  { name: "Plus ($20/month)", value: "plus", price: 20, releaseDate: "Feb-23" },
  { name: "Team ($25/month)", value: "team", price: 25, releaseDate: "Jan-24" },
  { name: "Pro ($200/month)", value: "pro", price: 200, releaseDate: "Dec-24" },
];

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ selectedPlan, onPlanChange }) => {
  return (
    <Select value={selectedPlan} onValueChange={onPlanChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a plan" />
      </SelectTrigger>
      <SelectContent className="backdrop-blur-[8px] border border-gray-200 dark:border-gray-800
        bg-white/70 dark:bg-gray-950/70 
        shadow-lg">
        {plans.map((plan) => (
          <SelectItem key={plan.value} value={plan.value} className="hover:bg-gray-100/70 dark:hover:bg-gray-800/70
          focus:bg-gray-100/70 dark:focus:bg-gray-800/70">
            {plan.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};