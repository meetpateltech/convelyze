import React from 'react';
import { MessageSquare, Calendar, User, Bot, Wrench, ArrowUpRight, LucideIcon, Clock, Sparkles, Activity } from 'lucide-react';
import GlassCard from '../cards/GlassCard';
import { Badge } from '@/components/ui/badge';

interface LongestConversationCardProps {
  data: {
    id: string;
    title: string;
    messageCount: number;
    roleDistribution: Record<string, number>;
    firstUsed: Date;
    lastUsed: Date;
  } | null;
}

interface RoleIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

const LongestConversationCard: React.FC<LongestConversationCardProps> = ({ data }) => {
  if (!data) {
    return (
      <GlassCard className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
          <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800/50 mb-4 animate-pulse">
            <MessageSquare className="w-12 h-12 opacity-50" />
          </div>
          <p className="text-lg font-medium tracking-tight">No conversation data available</p>
          <p className="text-sm opacity-60">Try processing a file first</p>
        </div>
      </GlassCard>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const roleIcons: Record<string, RoleIconConfig> = {
    system: { icon: Bot, color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
    user: { icon: User, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
    assistant: { icon: Sparkles, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
    tool: { icon: Wrench, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  };

  return (
    <GlassCard className="relative overflow-hidden group h-full flex flex-col">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors duration-500" />
      
      {/* Header */}
      <div className="relative mb-6">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Peak Interaction
            </h3>
          </div>
          <Badge variant="secondary" className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-none px-2.5 py-0.5 rounded-full font-bold">
            {data.messageCount.toLocaleString()} messages
          </Badge>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          Longest Conversation
        </h2>
      </div>

      {/* Main Link/Title Section */}
      <div className="flex-1 space-y-6">
        <a 
          href={`https://chatgpt.com/c/${data.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link block relative p-5 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:bg-white dark:hover:bg-zinc-800/50 transition-all duration-300"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Title</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover/link:text-teal-600 dark:group-hover/link:text-teal-400 transition-colors">
                {data.title || "Untitled Conversation"}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 group-hover/link:scale-110 group-hover/link:bg-teal-500 group-hover/link:text-white transition-all duration-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </a>

        {/* Role Distribution Chips */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 ml-1">Message Breakdown</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.roleDistribution).map(([role, count]) => {
              const config = roleIcons[role.toLowerCase()] || {
                icon: MessageSquare,
                color: 'text-zinc-500',
                bgColor: 'bg-zinc-500/10',
                borderColor: 'border-zinc-500/20'
              };
              const Icon = config.icon;

              return (
                <div 
                  key={role} 
                  className={`flex flex-col gap-2 p-3 rounded-xl border ${config.borderColor} ${config.bgColor} transition-transform hover:scale-[1.02] duration-200`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 capitalize">
                      {role}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-zinc-900 dark:text-white">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-medium opacity-50">msgs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-700/50 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Started</p>
            <p className="text-xs font-semibold">{formatDate(data.firstUsed)}</p>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-700/50" />

        <div className="flex items-center gap-3 text-right">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Last Active</p>
            <p className="text-xs font-semibold">{formatDate(data.lastUsed)}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default LongestConversationCard;