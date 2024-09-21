import React, { ReactNode } from 'react';
import GlassCard from '../cards/GlassCard';

interface UsageCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
}

const UsageCard: React.FC<UsageCardProps> = ({ title, value, subtitle, icon }) => (
  <GlassCard className="relative overflow-hidden aspect-square flex flex-col justify-between p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
    <div className="flex justify-between items-start">
      <div className="text-base font-medium text-gray-700 dark:text-white/70 uppercase tracking-wide">{title}</div>
      <div className="text-gray-800 dark:text-white/90 p-2 bg-gray-100 dark:bg-white/10 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ease-out">
        {icon}
      </div>
    </div>
    <div className="flex-grow flex items-center justify-center">
      <div className="text-7xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg transition-transform transform hover:scale-110 duration-300 ease-out">
        {value}
      </div>
    </div>
    <div className="text-sm text-gray-600 dark:text-white/60 text-center mt-3 tracking-wider">{subtitle}</div>
  </GlassCard>
);

export default UsageCard;