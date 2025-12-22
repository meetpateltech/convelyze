import React, { useState } from 'react';
import { Bot, MessageCircle, User, Wrench, ChevronRight } from 'lucide-react';
import GlassCard from '../cards/GlassCard';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface RoleBasedMessageCountProps {
  data: {
    overall?: {
      system?: number;
      user?: number;
      assistant?: number;
      tool?: number;
    };
    gpts?: {
      system?: number;
      user?: number;
      assistant?: number;
      tool?: number;
    };
    voice?: {
      user?: number;
      assistant?: number;
    };
  };
}

const RoleBasedMessageCount: React.FC<RoleBasedMessageCountProps> = ({ data }) => {
  const [dataType, setDataType] = useState<'overall' | 'gpts' | 'voice'>('overall');

  const currentData = data[dataType] || {};
  const totalMessages = Object.values(currentData).reduce((a, b) => a + (b ?? 0), 0);

  const roleConfigs = [
    { id: 'system', label: 'System', icon: Bot, color: 'text-orange-500', bgColor: 'bg-orange-500/10', barColor: 'bg-orange-500' },
    { id: 'user', label: 'User', icon: User, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', barColor: 'bg-emerald-500' },
    { id: 'assistant', label: 'Assistant', icon: MessageCircle, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', barColor: 'bg-cyan-500' },
    { id: 'tool', label: 'Tool', icon: Wrench, color: 'text-amber-500', bgColor: 'bg-amber-500/10', barColor: 'bg-amber-500' },
  ];

  const roleData = roleConfigs
    .filter(config => dataType !== 'voice' || (config.id === 'user' || config.id === 'assistant'))
    .map(config => {
      const value = (currentData as Record<string, number>)[config.id] ?? 0;
      const percentage = totalMessages > 0 ? (value / totalMessages) * 100 : 0;
      return { ...config, value, percentage };
    });

  return (
    <GlassCard className="flex flex-col h-full group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Role Distribution
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-semibold uppercase tracking-wider">
            {totalMessages.toLocaleString()} Total Messages
          </p>
        </div>
        
        <Tabs value={dataType} onValueChange={(v) => setDataType(v as 'overall' | 'gpts' | 'voice')} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-xl h-8 p-1">
            <TabsTrigger value="overall" className="text-[10px] uppercase font-bold tracking-wider py-1">Overall</TabsTrigger>
            <TabsTrigger value="gpts" className="text-[10px] uppercase font-bold tracking-wider py-1">GPTs</TabsTrigger>
            <TabsTrigger value="voice" className="text-[10px] uppercase font-bold tracking-wider py-1">Voice</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
        {roleData.map((item) => (
          <div 
            key={item.id} 
            className="group/item relative overflow-hidden bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/60 dark:hover:bg-zinc-800/60 hover:shadow-xl hover:shadow-zinc-500/5 dark:hover:shadow-black/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3 shadow-sm", item.bgColor)}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-tight">
                  {item.percentage.toFixed(1)}%
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover/item:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">
                {item.value.toLocaleString()}
              </p>
            </div>

            {/* Progress bar background */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100/50 dark:bg-zinc-800/30 overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-1000 ease-in-out", item.barColor)}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            
            {/* Ambient glow on hover */}
            <div className={cn(
              "absolute -inset-20 opacity-0 group-hover/item:opacity-20 transition-opacity blur-3xl pointer-events-none -z-10",
              item.bgColor
            )} />
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {roleData.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "w-6 h-6 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 shadow-sm transition-transform hover:-translate-y-0.5",
                item.color
              )}
            >
              <item.icon className="w-3 h-3" />
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default RoleBasedMessageCount;
