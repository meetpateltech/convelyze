import React, { ReactNode } from 'react';
import GlassCard from '../cards/GlassCard';

interface ToolUsageCardProps {
  icon: ReactNode;
  title: string;
  value: number;
  subtitle: string;
}

const ToolUsageCard: React.FC<ToolUsageCardProps> = ({ icon, title, value, subtitle }) => (
  <GlassCard className="relative overflow-hidden h-64 max-h-72 flex flex-col justify-between p-4 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out
    sm:h-56 sm:max-h-60">
    <div className="flex justify-between items-start">
      <div className="text-base font-medium text-gray-800 dark:text-white/70 uppercase tracking-wide sm:text-sm">{title}</div>
      <div className="text-gray-800 dark:text-white/90 p-2 bg-white/10 dark:bg-white/10 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ease-out">
        {icon}
      </div>
    </div>
    <div className="flex-grow flex items-center justify-center">
      <div className="text-6xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg transition-transform transform hover:scale-110 duration-300 ease-out sm:text-5xl">
        {value}
      </div>
    </div>
    <div className="text-sm text-gray-700 dark:text-white/60 text-center mt-2 tracking-wider sm:text-xs sm:mt-1">{subtitle}</div>
  </GlassCard>
);

export default ToolUsageCard;