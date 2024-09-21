import React from 'react';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import GlassCard from '../cards/GlassCard';

interface ShiftData {
  name: string;
  value: number;
}

interface ShiftWiseMessageCountProps {
  data: {
    shifts: Record<string, number>;
  };
}

const ShiftWiseMessageCount: React.FC<ShiftWiseMessageCountProps> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  const shiftData: ShiftData[] = Object.entries(data.shifts).map(([name, value]) => ({
    name,
    value
  }));

  const shiftIcons: Record<string, JSX.Element> = {
    morning: <Sunrise className="w-5 h-5 text-yellow-500" />,
    afternoon: <Sun className="w-5 h-5 text-orange-500" />,
    evening: <Sunset className="w-5 h-5 text-pink-500" />,
    night: <Moon className="w-5 h-5 text-blue-500" />,
  };

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Shift-Wise Message Count</h3>
      <div className="flex justify-between items-center mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={shiftData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {shiftData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {Object.entries(data.shifts).map(([name, value]) => (
          <div key={name} className="flex items-center space-x-3 bg-transparent rounded-lg p-3">
            {shiftIcons[name]}
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{name.charAt(0).toUpperCase() + name.slice(1)}:</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 ml-2">{value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ShiftWiseMessageCount; 