import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Sector } from 'recharts';
import GlassCard from '../cards/GlassCard';

interface DefaultModelSlugCountProps {
  data: Record<string, number>;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
        opacity={0.5}
      />
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 min-w-[160px]">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1.5">{data.name}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: payload[0].fill }}
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Conversations</span>
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
            {data.value.toLocaleString()}
          </span>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase">
            {((data.value / data.total) * 100).toFixed(1)}% of total
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const DefaultModelSlugCount: React.FC<DefaultModelSlugCountProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  const modelData = Object.entries(data)
    .sort((a, b) => b[1] - a[1]) // Sort by value for better visual
    .map(([name, value]) => ({
      name,
      value,
      total
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <GlassCard className="flex flex-col h-full min-h-[450px]">
      <div className="flex flex-col mb-2">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Model Distribution
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Primary model used in conversations
        </p>
      </div>

      <div className="flex-grow relative flex items-center justify-center">
        {/* Center label */}
        <div className="absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {total.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">
            Conversations
          </p>
        </div>

        <ResponsiveContainer width="100%" height={320} className="relative z-10">
          <PieChart>
            <Pie
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              data={modelData}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={5}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {modelData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="outline-none"
                />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip />} 
              wrapperStyle={{ zIndex: 100 }} 
            />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default DefaultModelSlugCount; 