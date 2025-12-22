import React from 'react';
import { Clock, Calendar, ArrowUpRight, History } from 'lucide-react';
import GlassCard from '../cards/GlassCard';

interface UsageTimelineProps {
  data: {
    firstUsed: string;
    lastUsed: string;
  };
}

const UsageTimeline: React.FC<UsageTimelineProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      short: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear()
    };
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const start = formatDate(data.firstUsed);
  const end = formatDate(data.lastUsed);
  const totalDays = calculateDuration(data.firstUsed, data.lastUsed);

  return (
    <GlassCard className="relative overflow-hidden group h-full">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />
      
      <div className="relative h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Usage Timeline
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Temporal span of your activity
            </p>
          </div>
          <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg shrink-0">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="space-y-8 relative flex-grow">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-20 dark:opacity-40" />

          {/* First Use */}
          <div className="flex items-start gap-4 relative">
            <div className="mt-1 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 flex items-center justify-center z-10 shadow-sm shrink-0">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">First Interaction</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{start.day}</span>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{start.month} {start.year}</span>
              </div>
            </div>
          </div>

          {/* Last Use */}
          <div className="flex items-start gap-4 relative">
            <div className="mt-1 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-pink-500 flex items-center justify-center z-10 shadow-sm shrink-0">
              <Clock className="w-4 h-4 text-pink-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-0.5">Most Recent</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{end.day}</span>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{end.month} {end.year}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">Total Lifespan</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">
                  {totalDays}
                </span>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">days</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" />
              Active
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default UsageTimeline;
