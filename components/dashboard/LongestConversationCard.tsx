import React from 'react';
import { MessageSquare, Calendar, User, Bot, Wrench, ArrowUpRight, LucideIcon } from 'lucide-react';
import GlassCard from '../cards/GlassCard';

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
}

const LongestConversationCard: React.FC<LongestConversationCardProps> = ({ data }) => {
  if (!data) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No conversation data available</p>
        </div>
      </GlassCard>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const roleIcons: Record<string, RoleIconConfig> = {
    system: { icon: Bot, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    user: { icon: User, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    assistant: { icon: MessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    tool: { icon: Wrench, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  };

  return (
    <GlassCard>
      {/* Header */}
      <div className="relative mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Longest Conversation
            </h3>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {data.messageCount.toLocaleString()} messages
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="mb-8">
        <a 
          href={`https://chatgpt.com/c/${data.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 p-4 rounded-lg"
        >
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors line-clamp-2">
              {data.title}
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </a>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Object.entries(data.roleDistribution).map(([role, count]) => {
          const IconConfig = roleIcons[role.toLowerCase()] || {
            icon: MessageSquare,
            color: 'text-gray-500',
            bgColor: 'bg-gray-500/10'
          };
          const Icon = IconConfig.icon;

          return (
            <div key={role} className="flex flex-col p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${IconConfig.bgColor} mr-3`}>
                  <Icon className={`w-5 h-5 ${IconConfig.color}`} />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                  {role}
                </p>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">First Used</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {formatDate(data.firstUsed)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Used</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {formatDate(data.lastUsed)}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default LongestConversationCard;