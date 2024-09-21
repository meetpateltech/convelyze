import React, { useState } from 'react';
import { Bot, MessageCircle, User, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '../cards/GlassCard';

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

  const roleData = dataType === 'voice' 
    ? [
        { label: 'User', value: data.voice?.user ?? 0, icon: User, color: 'text-green-500' },
        { label: 'Assistant', value: data.voice?.assistant ?? 0, icon: MessageCircle, color: 'text-purple-500' },
      ]
    : [
        { label: 'System', value: data[dataType]?.system ?? 0, icon: Bot, color: 'text-blue-500' },
        { label: 'User', value: data[dataType]?.user ?? 0, icon: User, color: 'text-green-500' },
        { label: 'Assistant', value: data[dataType]?.assistant ?? 0, icon: MessageCircle, color: 'text-purple-500' },
        { label: 'Tool', value: data[dataType]?.tool ?? 0, icon: Wrench, color: 'text-yellow-500' },
      ];

  return (
    <GlassCard>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Role-Based Messages</h3>
        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-full p-1">
          <Button
            variant={dataType === 'overall' ? 'outline' : 'ghost'}
            className={`rounded-full px-3 py-1 text-xs ${dataType === 'overall' ? 'bg-white dark:bg-gray-600' : ''}`}
            onClick={() => setDataType('overall')}
          >
            Overall
          </Button>
          <Button
            variant={dataType === 'gpts' ? 'outline' : 'ghost'}
            className={`rounded-full px-3 py-1 text-xs ${dataType === 'gpts' ? 'bg-white dark:bg-gray-600' : ''}`}
            onClick={() => setDataType('gpts')}
          >
            GPTs
          </Button>
          <Button
            variant={dataType === 'voice' ? 'outline' : 'ghost'}
            className={`rounded-full px-3 py-1 text-xs ${dataType === 'voice' ? 'bg-white dark:bg-gray-600' : ''}`}
            onClick={() => setDataType('voice')}
          >
            Voice
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 flex-grow sm:ml-0 -ml-2">
        {roleData.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center bg-transparent rounded-lg p-4 transition-all duration-300 hover:shadow-md">
            <div className={`flex-shrink-0 p-3 rounded-full ${color} bg-opacity-10 mr-4`}>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <div className="flex flex-col justify-between flex-grow">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Total messages: {Object.values(data[dataType] ?? {}).reduce((a, b) => a + (b ?? 0), 0).toLocaleString()}
      </div>
    </GlassCard>
  );
};

export default RoleBasedMessageCount;