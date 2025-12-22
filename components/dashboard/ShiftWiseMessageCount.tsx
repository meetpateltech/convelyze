import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from 'recharts';
import GlassCard from '../cards/GlassCard';

interface ShiftData {
  name: string;
  value: number;
  color: string;
}

interface ShiftWiseMessageCountProps {
  data: {
    shifts: Record<string, number>;
  };
}

const renderActiveShape = (props: unknown) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload
  } = props as {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    payload: { name: string; value: number; color: string };
  };

  return (
    <g>
      <text 
        x={cx} 
        y={cy} 
        dy={-35} 
        textAnchor="middle" 
        fill={fill} 
        className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-90"
      >
        {payload.name}
      </text>
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
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, total }: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; color: string } }>;
  total: number;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 min-w-[120px]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 capitalize">{data.name}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex justify-between gap-4">
            Messages: <span className="font-bold text-zinc-900 dark:text-zinc-50">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex justify-between gap-4">
            Share: <span className="font-bold text-zinc-900 dark:text-zinc-50">{percentage}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const SHIFT_COLORS: Record<string, string> = {
  morning: '#FBBF24',   // yellow-400
  afternoon: '#F97316', // orange-500
  evening: '#EC4899',   // pink-500
  night: '#6366F1',     // indigo-500
  unspecified: '#94A3B8' // slate-400
};

const ShiftWiseMessageCount: React.FC<ShiftWiseMessageCountProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const shiftData: ShiftData[] = useMemo(() => 
    Object.entries(data.shifts).map(([name, value]) => ({
      name,
      value,
      color: SHIFT_COLORS[name] || '#8884d8'
    })), [data.shifts]);

  useEffect(() => {
    if (shiftData.length > 0) {
      let maxIdx = 0;
      let maxValue = -1;
      let foundValid = false;

      shiftData.forEach((item, index) => {
        // Exclude 'unspecified' from being the highest highlighted one
        if (item.name.toLowerCase() !== 'unspecified') {
          if (item.value > maxValue) {
            maxValue = item.value;
            maxIdx = index;
            foundValid = true;
          }
        }
      });

      // If we found a valid max (not unspecified), set it. 
      // Otherwise default to the first index if any.
      if (foundValid) {
        setActiveIndex(maxIdx);
      } else {
        setActiveIndex(0);
      }
    }
  }, [shiftData]);

  const shiftIcons: Record<string, JSX.Element> = {
    morning: <Sunrise className="w-5 h-5" style={{ color: SHIFT_COLORS.morning }} />,
    afternoon: <Sun className="w-5 h-5" style={{ color: SHIFT_COLORS.afternoon }} />,
    evening: <Sunset className="w-5 h-5" style={{ color: SHIFT_COLORS.evening }} />,
    night: <Moon className="w-5 h-5" style={{ color: SHIFT_COLORS.night }} />,
    unspecified: <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-400 opacity-50" />
  };

  const totalMessages = shiftData.reduce((acc, curr) => acc + curr.value, 0);

  const onPieEnter = (_data: unknown, index: number) => {
    setActiveIndex(index);
  };

  return (
    <GlassCard className="flex flex-col h-full overflow-hidden">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Shift Activity</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium tracking-medium">Message distribution by time of day</p>
      
      <div className="relative flex-grow flex items-center justify-center min-h-[220px]">
        {/* Center Text for Total - placed before chart to stay behind the tooltip */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {totalMessages.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] mt-1.5">
            TOTAL
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={shiftData}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={6}
              dataKey="value"
              onMouseEnter={onPieEnter}
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {shiftData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    filter: activeIndex === index ? `drop-shadow(0 0 8px ${entry.color}44)` : 'none'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={totalMessages} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-6">
        {shiftData.map((item, index) => (
          <div 
            key={item.name} 
            className={`flex items-center space-x-3 p-2.5 rounded-2xl transition-all duration-300 cursor-pointer ${
              activeIndex === index 
                ? 'bg-white/30 dark:bg-white/10 shadow-lg ring-1 ring-white/40 dark:ring-white/10' 
                : 'bg-white/5 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10'
            }`}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div className={`p-2 rounded-xl transition-colors duration-300 ${
              activeIndex === index ? 'bg-white/40 dark:bg-black/40' : 'bg-white/10 dark:bg-black/20'
            }`}>
              {shiftIcons[item.name]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wide truncate">
                {item.name}
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                {item.value.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ShiftWiseMessageCount;
