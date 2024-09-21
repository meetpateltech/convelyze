import React from 'react';
import GlassCard from './GlassCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, subValue }) => (
  <GlassCard>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
      {subValue && <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subValue}</span>}
    </div>
  </GlassCard>
);

export default MetricCard;