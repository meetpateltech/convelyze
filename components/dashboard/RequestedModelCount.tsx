import React from 'react';
import GlassCard from '../cards/GlassCard';

interface RequestedModelCountProps {
  data: Record<string, number>;
}

const RequestedModelCount: React.FC<RequestedModelCountProps> = ({ data }) => {
  const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <GlassCard className="h-[400px] overflow-hidden">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Requested Model Count</h3>
      <div className="overflow-y-auto h-[320px] pr-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-sm font-semibold text-gray-600 dark:text-gray-400 pb-2">Model</th>
              <th className="text-right text-sm font-semibold text-gray-600 dark:text-gray-400 pb-2">Count</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map(([model, count]) => (
              <tr key={model} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-3 text-sm text-gray-800 dark:text-gray-200">{model}</td>
                <td className="py-3 text-sm text-right font-semibold text-gray-800 dark:text-gray-200">{count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

export default RequestedModelCount;