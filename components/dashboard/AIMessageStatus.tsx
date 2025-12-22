import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from 'recharts';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 min-w-[150px]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{data.name}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex justify-between gap-4">
            Count: <span className="font-bold text-zinc-900 dark:text-zinc-50">{data.value.toLocaleString()}</span>
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

const AIMessageStatus: React.FC<AIMessageStatusProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    finished_successfully: {
      color: '#10B981', // emerald-500
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      label: 'Success'
    },
    in_progress: {
      color: '#3B82F6', // blue-500
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      label: 'In Progress'
    },
    finished_partial_completion: {
      color: '#F59E0B', // amber-500
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
      label: 'Partial'
    }
  };
  
  const statusData = Object.entries(data.assistant).map(([status, count]) => ({
    name: STATUS_CONFIG[status]?.label || status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value: count,
    color: STATUS_CONFIG[status]?.color || '#8884d8',
    key: status
  }));

  const total = Object.values(data.assistant).reduce((sum, value) => sum + value, 0);

  const onPieEnter = (_data: unknown, index: number) => {
    setActiveIndex(index);
  };

  return (
    <GlassCard className="flex flex-col h-full overflow-hidden">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">AI Message Status</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium tracking-medium">Distribution of assistant response outcomes</p>
      
      <div className="relative flex-grow flex items-center justify-center min-h-[220px]">
        {/* Center Text for Total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {total.toLocaleString()}
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
              data={statusData}
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
              {statusData.map((entry, index) => (
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
            <Tooltip content={<CustomTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-2 mt-6">
        {statusData.map((item, index) => (
          <div 
            key={item.key} 
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
              {STATUS_CONFIG[item.key]?.icon}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                {item.name}
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                {item.value.toLocaleString()}
              </span>
            </div>
            {total > 0 && (
              <div className="ml-auto text-xs font-bold text-gray-400 dark:text-gray-500">
                {((item.value / total) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default AIMessageStatus;
