import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import GlassCard from '../cards/GlassCard';

interface AIMessageStatusProps {
  data: {
    assistant: {
      finished_successfully: number;
      in_progress: number;
      finished_partial_completion: number;
    };
  };
}

const AIMessageStatus: React.FC<AIMessageStatusProps> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  const statusData = Object.entries(data.assistant).map(([status, count]) => ({
    name: status.split('_').map(word =>  word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value: count
  }));

  const total = Object.values(data.assistant).reduce((sum, value) => sum + value, 0);

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">AI Message Status</h3>
      <div className="flex justify-between items-center mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {statusData.map(({ name, value }, index) => (
          <div key={name} className="flex items-center justify-between bg-transparent rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{name}:</span>
            </div>
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{value.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Total AI messages: {total.toLocaleString()}
      </div>
    </GlassCard>
  );
};

export default AIMessageStatus; 