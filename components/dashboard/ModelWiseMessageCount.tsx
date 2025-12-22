import React from 'react';
import { Cpu, Zap, ChevronRight, Activity } from 'lucide-react';
import GlassCard from '../cards/GlassCard';
import { cn } from "@/lib/utils";

interface ModelWiseMessageCountProps {
  data: Record<string, number>;
}

const ModelWiseMessageCount: React.FC<ModelWiseMessageCountProps> = ({ data }) => {
  const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const totalMessages = Object.values(data).reduce((a, b) => a + b, 0);

  // Color palette for models - using a refined selection of colors
  const colors = [
    { color: 'text-sky-500', bgColor: 'bg-sky-500/10', barColor: 'bg-sky-500' },
    { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', barColor: 'bg-emerald-500' },
    { color: 'text-orange-500', bgColor: 'bg-orange-500/10', barColor: 'bg-orange-500' },
    { color: 'text-amber-500', bgColor: 'bg-amber-500/10', barColor: 'bg-amber-500' },
    { color: 'text-rose-500', bgColor: 'bg-rose-500/10', barColor: 'bg-rose-500' },
    { color: 'text-teal-500', bgColor: 'bg-teal-500/10', barColor: 'bg-teal-500' },
    { color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', barColor: 'bg-cyan-500' },
  ];

  return (
    <GlassCard className="flex flex-col h-[500px] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-500" />
            Model Message Count
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-semibold uppercase tracking-wider">
            {sortedData.length} active models detected
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 dark:bg-zinc-900/50 px-4 py-2 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <div>
            <p className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tighter leading-none">
              {totalMessages.toLocaleString()}
            </p>
            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Total Messages</p>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow pr-2 -mr-2 space-y-3 custom-scrollbar">
        {sortedData.map(([model, count], index) => {
          const percentage = totalMessages > 0 ? (count / totalMessages) * 100 : 0;
          const colorConfig = colors[index % colors.length];

          return (
            <div 
              key={model} 
              className="relative overflow-hidden bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl transition-all duration-300 shadow-sm", colorConfig.bgColor)}>
                    <Zap className={cn("w-5 h-5", colorConfig.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 truncate pr-2">
                      {model}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        {count.toLocaleString()} messages
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                      {percentage.toFixed(1)}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Progress bar background */}
              <div className="relative h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                <div 
                  className={cn("absolute inset-y-0 left-0 transition-all duration-1000 ease-in-out rounded-full", colorConfig.barColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </GlassCard>
  );
};

export default ModelWiseMessageCount;
