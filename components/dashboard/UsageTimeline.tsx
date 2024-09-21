import React from 'react';
import { Clock } from 'lucide-react';
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Usage Timeline</h3>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">First Used:</span>
        </div>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{formatDate(data.firstUsed)}</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="w-6 h-6 text-green-500 mr-2" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Used:</span>
        </div>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{formatDate(data.lastUsed)}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Duration:</span>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {calculateDuration(data.firstUsed, data.lastUsed)} days
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default UsageTimeline; 