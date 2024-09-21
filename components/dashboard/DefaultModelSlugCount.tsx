import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import GlassCard from '../cards/GlassCard';

interface DefaultModelSlugCountProps {
  data: Record<string, number>;
}

const DefaultModelSlugCount: React.FC<DefaultModelSlugCountProps> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  const modelData = Object.entries(data).map(([name, value]) => ({
    name,
    value
  }));

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Default Model in Conversation</h3>
      <div className="flex justify-between items-center mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={modelData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {modelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Total conversations: {total.toLocaleString()}
      </div>
    </GlassCard>
  );
};

export default DefaultModelSlugCount; 