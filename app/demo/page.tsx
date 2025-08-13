'use client'

import React, { useState } from 'react';
import { MessageCircle, MessageSquare, Image as ImageIcon, Mic, Calendar, Users, Archive, BarChart2, ChartColumn, FileText, Video, Brain, Code, Globe, ScanSearch, CircleStop, UserCog, MessageCircleReply, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityCalendar from '@/components/dashboard/ActivityCalendar';
import { activityData } from '@/lib/activityData';
import NetworkLocationCard from '@/components/dashboard/NetworkLocationCard';
import MetricCard from '@/components/cards/MetricCard';
import GlassCard from '@/components/cards/GlassCard';
import RoleBasedMessageCount from '@/components/dashboard/RoleBasedMessageCount';
import ShiftWiseMessageCount from '@/components/dashboard/ShiftWiseMessageCount';
import ModelWiseMessageCount from '@/components/dashboard/ModelWiseMessageCount';
import UsageTimeline from '@/components/dashboard/UsageTimeline';
import DefaultModelSlugCount from '@/components/dashboard/DefaultModelSlugCount';
import AIMessageStatus from '@/components/dashboard/AIMessageStatus';
import UsageCard from '@/components/dashboard/UsageCard';
import ToolUsageCard from '@/components/dashboard/ToolUsageCard';
import Background from '@/components/ui/background';
import { ModeToggle } from '@/components/ModeToggle';
import Link from 'next/link';
import { TokenUsageCard } from '@/components/dashboard/TokenUsageCard';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { formatCurrency } from '@/components/dashboard/TokenDisplay';
import { calculateCost, getPricing } from '@/utils/pricing';
import { TokenUsageBarChart } from '@/components/dashboard/TokenUsageBarChart';
import { CostLineChart } from '@/components/dashboard/CostLineChart';
import UserSystemHintsCard from '@/components/dashboard/UserSystemHintsCard';
import { PlanSelector } from '@/components/dashboard/PlanSelector';
import AICodeStatsCard from '@/components/dashboard/CodeBlockCount';
import { CanvasStats } from '@/components/dashboard/CanvasStats';

interface TokenUsage {
  userTokens: number;
  assistantTokens: number;
}

interface MonthlyData {
  [modelName: string]: TokenUsage;
}

interface TokenUsageData {
  [month: string]: MonthlyData;
}

export default function Dashboard() {
  const [mode, setMode] = useState('normal');
  const [timeUnit, setTimeUnit] = useState('D');

  const dashboardData = {
    totalConversations: 777,
    totalGPTConversations: 49,
    totalMessages: 22247,
    totalGPTMessages: 310,
    mostChattyDay: { date: '2024-02-29', count: 224 },
    timeSpentOnChatGPT: { hours: 1296, days: 54, seconds: 77760 },
    averageDailyMessageCount: 30,
    totalArchivedConversations: 50,
    totalVoiceMessages: 69,
    totalImagesGenerated: 143, // Sum of DALL·E images with and without Gizmo
    systemsHintCount: {
      search: 420,
      picture: 123,
      reason: 333,
      canvas: 150,
      tatertot: 77,
    },
    codeBlockCount: {
      total: 943,
      javascript: 156,
      typescript: 143,
      python: 98,
      java: 76,
      sql: 65,
      html: 54,
      css: 48,
      php: 42,
      ruby: 38,
      go: 35,
      rust: 29,
      swift: 27,
      kotlin: 25,
      csharp: 23,
      shell: 21,
      yaml: 19,
      json: 17,
      markdown: 15,
      dockerfile: 12
    },
    canvasCodeBlockCount: {
      total: 445,
      javascript: 87,
      typescript: 65,
      python: 43,
      html: 38,
      css: 35,
      jsx: 32,
      tsx: 28,
      scss: 25,
      java: 22,
      go: 18,
      ruby: 15,
      php: 12,
      rust: 10,
      swift: 8,
      kotlin: 7
    },
    documentStats: {
      emoji: {
        total: 847,
        words: 324,
        sections: 156,
        lists: 289,
        remove: 78
      },
      suggestEdits: {
        totalSuggestEdits: 456,
        totalCommentsAdded: 892
      },
      polish: 234,
      readingLevel: {
        total: 678,
        graduate: 145,
        college: 234,
        highSchool: 167,
        middleSchool: 89,
        kindergarten: 43
      },
      length: {
        total: 567,
        longest: 178,
        longer: 156,
        shorter: 145,
        shortest: 88
      }
    },
    codeStats: {
      comments: {
        total: 934,
        javascript: 345,
        python: 256,
        typescript: 178,
        java: 155
      },
      logs: {
        total: 456,
        javascript: 189,
        python: 134,
        typescript: 89,
        java: 44
      },
      fixBugs: {
        total: 345,
        javascript: 123,
        python: 98,
        typescript: 76,
        java: 48
      },
      review: {
        total: {
          reviews: 567,
          comments: 1234
        },
        javascript: {
          reviews: 234,
          comments: 456
        },
        python: {
          reviews: 156,
          comments: 345
        },
        typescript: {
          reviews: 123,
          comments: 289
        },
        java: {
          reviews: 54,
          comments: 144
        }
      },
      port: {
        total: 789,
        php: 145,
        cpp: 123,
        python: 167,
        javascript: 178,
        typescript: 98,
        java: 78
      }
    },
  };

  const getTimeSpentValue = () => {
    switch (timeUnit) {
      case 'D':
        return `${dashboardData.timeSpentOnChatGPT.days.toFixed(2)} days`;
      case 'H':
        return `${dashboardData.timeSpentOnChatGPT.hours.toFixed(2)} hours`;
      case 'M':
        return `${(dashboardData.timeSpentOnChatGPT.seconds / 60).toFixed(2)} minutes`;
      default:
        return `${dashboardData.timeSpentOnChatGPT.days.toFixed(2)} days`;
    }
  };

  const roleBasedMessageData = {
    overall: {
      system: 1503,
      user: 10090,
      assistant: 10321,
      tool: 333
    },
    gpts: {
      system: 67,
      user: 77,
      assistant: 89,
      tool: 77
    },
    voice: {
      user: 33,
      assistant: 36
    }
  }

  const shiftWiseMessageData = {
    shifts: {
      morning: 5432,
      afternoon: 6789,
      evening: 4321,
      night: 5705,
    }
  }

  const modelWiseMessageData = {
    'gpt-4o': 3912,
    'gpt-4o-mini': 1434,
    'gpt-4':940,
    'gpt-4-turbo':1085,
    'unknown': 251,
    'gpt-3.5-turbo':2189,
    'text-davinci-002-render-sha': 430,
    'o1-preview':30,
    'o1-mini':50
  }

  const usageTimelineData = {
    firstUsed: '2022-11-30',
    lastUsed: '2024-09-03'
  }

  const defaultModelSlugData = {
    auto: 465,
    'o1-preview':5,
    'o1-mini':5,
    'gpt-4o': 56,
    'gpt-4-turbo':23,
    'gpt-4':10,
    'text-davinci-002-render-sha': 68,
    'gpt-3.5-turbo':55,
    unknown: 90
  }

  const aiMessageStatusData = {
    user: { finished_successfully: 10090 },
    assistant: {
      finished_successfully: 9567,
      in_progress: 424,
      finished_partial_completion: 330
    }
  }

  const modelAdjustmentsCount = { 'auto:smaller_model:reached_message_cap': 1094 }
  const userAttachmentMimeTypeCount = {
    'image/png': 124,
    'application/octet-stream': 5,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 1,
    'image/jpeg': 6,
    'image/webp': 2,
    'application/pdf': 64,
    'video/mp4': 8
  }

  const imageAttachmentCount = Object.entries(userAttachmentMimeTypeCount)
    .filter(([key]) => key.startsWith('image/'))
    .reduce((sum, [, value]) => sum + value, 0)

  const videoAttachmentCount = Object.entries(userAttachmentMimeTypeCount)
    .filter(([key]) => key.startsWith('video/'))
    .reduce((sum, [, value]) => sum + value, 0)

  const pdfAttachmentCount = userAttachmentMimeTypeCount['application/pdf'] || 0

  const toolUsageData = {
    bio: 224,
    python: 360,
    browser: 278,
    webpage: 435
  }

  const locationData = {
    user: { SFO: 2077, LAS: 529, TXL: 130, BOM: 1, SIN: 13, FRA: 17, AMS: 2 },
    assistant: { SFO: 2544, LAS: 702, MEX: 1, LHR: 1, TXL: 184, BOM: 1, SIN: 15, FRA: 17 }
  }

  const tokenUsageData: TokenUsageData = {
    'Jan-25': {
      'o1-mini': { userTokens: 460000, assistantTokens: 510000 },
      'gpt-4o': { userTokens: 110000, assistantTokens: 115000 },
      'o3-mini': { userTokens: 245000, assistantTokens: 240000 },
      'o1': { userTokens: 560000, assistantTokens: 580000 },
      'o1-pro': { userTokens: 710000, assistantTokens: 730000 }
    },
    'Dec-24': {
      'o1-preview': { userTokens: 150000, assistantTokens: 180000 },
      'o1-mini': { userTokens: 400000, assistantTokens: 450000 },
      'gpt-4o': { userTokens: 95000, assistantTokens: 100000 },
      'gpt-4o-mini': { userTokens: 235000, assistantTokens: 230000 },
      'o1': { userTokens: 500000, assistantTokens: 520000 },
      'o1-pro': { userTokens: 600000, assistantTokens: 620000 }
    },
    'Nov-24': {
      'o1-preview': { userTokens: 105000, assistantTokens: 190000 },
      'o1-mini': { userTokens: 250000, assistantTokens: 340000 },
      'gpt-4o': { userTokens: 95000, assistantTokens: 100000 },
      'gpt-4o-mini': { userTokens: 235000, assistantTokens: 230000 },
    },
    'Oct-24': {
      'o1-preview': { userTokens: 101345, assistantTokens: 191824 },
      'o1-mini': { userTokens: 247382, assistantTokens: 342193 },
      'gpt-4o': { userTokens: 95422, assistantTokens: 99693 },
      'gpt-4o-mini': { userTokens: 234345, assistantTokens: 234545 },
    },
    'Sep-24': {
      'gpt-4o': { userTokens: 195422, assistantTokens: 196693 },
      'gpt-4o-mini': { userTokens: 73353, assistantTokens: 115323 },
      'o1-preview': { userTokens: 58978, assistantTokens: 120323 },
      'o1-mini': {userTokens: 134544, assistantTokens: 223434}
    },
    'Aug-24': {
      'gpt-4o': { userTokens: 298422, assistantTokens: 297693 },
      'gpt-4o-mini': { userTokens: 83353, assistantTokens: 115323 },
      'gpt-4': { userTokens: 76778, assistantTokens: 106693 },
    },
    'Jul-24': {
      'gpt-4o': { userTokens: 330738, assistantTokens: 247852 },
      'gpt-4o-mini': { userTokens: 149258, assistantTokens: 156448 },
      'text-davinci-002-render': { userTokens: 564645, assistantTokens: 675644}
    },
    'Jun-24': {
      'gpt-4o': { userTokens: 219123, assistantTokens: 231419 },
      'gpt-4': { userTokens: 191542, assistantTokens: 141639 },
      'gpt-3.5-turbo': { userTokens: 229951, assistantTokens: 408219 }
    },
    'May-24': {
      'gpt-4o': { userTokens: 130738, assistantTokens: 247852 },
      'gpt-3.5-turbo': { userTokens: 341911, assistantTokens: 395197 },
      'gpt-4': { userTokens: 179876, assistantTokens: 134635 },
      'text-davinci-002-render': { userTokens: 65787, assistantTokens: 67564}
    },
    'Apr-24': {
      'gpt-3.5-turbo': { userTokens: 241911, assistantTokens: 295197 },
      'gpt-4': { userTokens: 179876, assistantTokens: 184635 },
      'text-davinci-002-render': { userTokens: 46319, assistantTokens: 64118 }
    },
    'Mar-24': {
      'gpt-4': { userTokens: 179876, assistantTokens: 184635 },
      'gpt-3.5-turbo': { userTokens: 478219, assistantTokens: 394635 },
      'gpt-4-turbo': { userTokens: 149876, assistantTokens: 144635 },

    },
    'Feb-24': {
      'gpt-4': { userTokens: 219387, assistantTokens: 270851 },
      'gpt-3.5-turbo': { userTokens: 195621, assistantTokens: 199189 },
      'text-davinci-002-render': { userTokens: 278195, assistantTokens: 200982 }
    },
    'Jan-24': {
      'gpt-4': { userTokens: 170953, assistantTokens: 197521 },
      'gpt-3.5-turbo': { userTokens: 182451, assistantTokens: 189621 },
      'text-davinci-002-render': { userTokens: 94382, assistantTokens: 62719 }
    },
    'Dec-23': {
      'gpt-4-turbo': { userTokens: 185938, assistantTokens: 196119 },
      'gpt-4': { userTokens: 149278, assistantTokens: 130509 },
      'gpt-3.5-turbo': { userTokens: 164658, assistantTokens: 165983 },
      'text-davinci-002-render': { userTokens: 85938, assistantTokens: 60611 },
    },
    'Nov-23': {
      'gpt-4-turbo': { userTokens: 198422, assistantTokens: 194693 },
      'gpt-4': { userTokens: 165778, assistantTokens: 156693 },
      'gpt-3.5-turbo': { userTokens: 176788, assistantTokens: 146693 },
    },
    'Oct-23': {
      'gpt-4': { userTokens: 195422, assistantTokens: 196693 },
      'gpt-4-vision-preview': { userTokens: 15422, assistantTokens: 19669 },
      'gpt-3.5-turbo': { userTokens: 154220, assistantTokens: 196693 },
      'text-davinci-002-render': { userTokens: 97879, assistantTokens: 96693 },
    }, 
    'Sep-23': {
      'gpt-4-vision-preview': { userTokens: 95422, assistantTokens: 96693 },
      'gpt-3.5-turbo': { userTokens: 95422, assistantTokens: 96693 },
      'text-davinci-002-render': { userTokens: 65422, assistantTokens: 46693 },
    },
    'Aug-23': {
      'gpt-3.5-turbo': { userTokens: 187482, assistantTokens: 129851 },
      'gpt-4': { userTokens: 146735, assistantTokens: 162319 },
      'text-davinci-002-render': { userTokens: 121043, assistantTokens: 98392 }
    },
    'Jul-23': {
      'gpt-3.5-turbo': { userTokens: 145213, assistantTokens: 167621 },
      'gpt-4': { userTokens: 121043, assistantTokens: 178392 }
    },
    'Jun-23': {
      'gpt-3.5-turbo': { userTokens: 217812, assistantTokens: 195654},
      'gpt-4': { userTokens: 278517, assistantTokens: 128421},
    },
    'May-23': {
      'gpt-3.5-turbo': { userTokens: 825431, assistantTokens: 916182},
      'gpt-4': { userTokens: 315928, assistantTokens: 225675},
    },
    'Apr-23': {
      'gpt-3.5-turbo': { userTokens: 287976, assistantTokens: 289877},
      'gpt-4': { userTokens: 335645, assistantTokens: 347879},
    },
    'Mar-23': {
      'gpt-3.5-turbo': { userTokens: 335645, assistantTokens: 397879},
      'gpt-4': { userTokens: 135645, assistantTokens: 147879},
      'text-davinci-002-render': { userTokens: 48095, assistantTokens: 47685}
    },
    'Feb-23': {
      'gpt-3.5-turbo': { userTokens: 335645, assistantTokens: 397879},
      'text-davinci-002-render': { userTokens: 98095, assistantTokens: 97685}
    },
    'Jan-23': {
      'gpt-3.5-turbo': { userTokens: 135645, assistantTokens: 197879},
      'text-davinci-002-render': { userTokens: 235645, assistantTokens: 297879}
    },
    'Dec-22': {
      'text-davinci-002-render-sha': { userTokens: 364645, assistantTokens: 375644}
    },
    'Nov-22': {
      'text-davinci-002-render-sha': { userTokens: 142342, assistantTokens: 109332}
    },
  };
  const calculateTotals = (data: TokenUsageData) => {
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalInputCost = 0;
    let totalOutputCost = 0;

    Object.values(data).forEach(monthData => {
      Object.entries(monthData).forEach(([modelName, usage]) => {
        totalInputTokens += usage.userTokens;
        totalOutputTokens += usage.assistantTokens;
        const pricing = getPricing(modelName);
        totalInputCost += calculateCost(usage.userTokens, pricing.inputCost);
        totalOutputCost += calculateCost(usage.assistantTokens, pricing.outputCost);
      });
    });

    return {
      tokens: {
        input: totalInputTokens,
        output: totalOutputTokens,
        total: totalInputTokens + totalOutputTokens
      },
      cost: {
        input: formatCurrency(totalInputCost),
        output: formatCurrency(totalOutputCost),
        total: formatCurrency(totalInputCost + totalOutputCost)
      }
    };
  };

  const totals = calculateTotals(tokenUsageData);

  const [selectedYear, setSelectedYear] = useState(2024);

  const [selectedPlan, setSelectedPlan] = useState('free');
  
  return (
    <>
      <Background />
      <div className="relative z-20 min-h-screen transition-colors duration-300 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-8 space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Demo Dashboard</h1>

            <div className="flex items-center space-x-4">
            <Link href="/dashboard">
               <Button variant="outline" className="rounded-full px-3 py-1">
                   Try it
               </Button>
             </Link>
            <ModeToggle />
              <div className="flex flex-wrap bg-white/20 dark:bg-white/5 backdrop-filter backdrop-blur-lg rounded-full p-1">
                <Button
                  variant={mode === 'normal' ? 'secondary' : 'ghost'}
                  className={`rounded-full px-3 py-1 ${mode === 'normal' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-800 dark:text-white'}`}
                  onClick={() => setMode('normal')}
                >
                  Normal
                </Button>
                <Button
                  variant={mode === 'advanced' ? 'secondary' : 'ghost'}
                  className={`rounded-full px-3 py-1 ${mode === 'advanced' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-800 dark:text-white'}`}
                  onClick={() => setMode('advanced')}
                >
                  Advanced {mode === 'advanced' && '🔒'}
                </Button>
                <Button
                  variant={mode === 'token' ? 'secondary' : 'ghost'}
                  className={`rounded-full px-3 py-1 ${mode === 'token' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-800 dark:text-white'}`}
                  onClick={() => setMode('token')}
                >
                  Tokens
                </Button>
              </div>
            </div>
          </div>

          {mode === 'normal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Existing MetricCards */}
              <MetricCard
                title="Total Conversations"
                value={dashboardData.totalConversations}
                icon={<MessageCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />}
              />
              <MetricCard
                title="Total Messages"
                value={dashboardData.totalMessages}
                icon={<MessageSquare className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
              />
              <MetricCard
                title="GPTs"
                value={dashboardData.totalGPTConversations}
                subValue={`${dashboardData.totalGPTMessages} messages`}
                icon={<Users className="w-8 h-8 text-purple-500 dark:text-purple-400" />}
              />
              <MetricCard
                title="Total Voice Messages"
                value={dashboardData.totalVoiceMessages}
                icon={<Mic className="w-8 h-8 text-pink-500 dark:text-pink-400" />}
              />
              <MetricCard
                title="Total Images Generated"
                value={dashboardData.totalImagesGenerated}
                icon={<ImageIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />}
              />
              <MetricCard
                title="Total Archived Conversations"
                value={dashboardData.totalArchivedConversations}
                icon={<Archive className="w-8 h-8 text-red-500 dark:text-red-400" />}
              />
              <MetricCard
                title="Most Chatty Day"
                value={`${dashboardData.mostChattyDay.count} messages`}
                subValue={dashboardData.mostChattyDay.date}
                icon={<Calendar className="w-8 h-8 text-red-500 dark:text-red-400" />}
              />
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Time Spent on ChatGPT</h3>
                  <BarChart2 className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {getTimeSpentValue()}
                  </span>
                  <div className="flex space-x-2">
                    {['D', 'H', 'M'].map((unit) => (
                      <Button
                        key={unit}
                        variant="outline"
                        size="sm"
                        className={`rounded-full ${
                          timeUnit === unit 
                            ? 'bg-indigo-500 text-white dark:bg-indigo-600' 
                            : 'bg-white/20 dark:bg-white/5 text-gray-800 dark:text-gray-200'
                        }`}
                        onClick={() => setTimeUnit(unit)}
                      >
                        {unit}
                      </Button>
                    ))}
                  </div>
                </div>
              </GlassCard>
              <MetricCard
                title="Average Daily Message"
                value={`${dashboardData.averageDailyMessageCount.toFixed(3)} messages`}
                icon={<ChartColumn className="w-8 h-8 text-teal-600 dark:text-teal-400" />}
              />
              
              {/* New Activity Calendar */}
              <GlassCard className="col-span-full">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Activity Calendar</h3>
                <ActivityCalendar data={activityData} />
              </GlassCard>
            </div>
          )}

          {mode === 'advanced' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RoleBasedMessageCount data={roleBasedMessageData} />
              <ModelWiseMessageCount data={modelWiseMessageData} />
              <ShiftWiseMessageCount data={shiftWiseMessageData} />
              <UsageTimeline data={usageTimelineData} />
              <DefaultModelSlugCount data={defaultModelSlugData} />
              <AIMessageStatus data={aiMessageStatusData} />

              <div className="col-span-full">
                <AICodeStatsCard codeBlockCount={dashboardData.codeBlockCount} canvasCodeBlockCount={dashboardData.canvasCodeBlockCount} />
              </div>

              <div className="col-span-full">
              <UserSystemHintsCard data={dashboardData.systemsHintCount} />
              </div>

              <div className="col-span-full">
                <CanvasStats
                  documentStats={dashboardData.documentStats}
                  codeStats={dashboardData.codeStats}
                />
              </div>
            
              {/* Existing usage cards */}
              <div className="col-span-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usage Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <UsageCard
                    title="You've"
                    value={modelAdjustmentsCount['auto:smaller_model:reached_message_cap']}
                    subtitle="times reached limit cap still continue chat"
                    icon={<MessageCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />}
                  />
                  <UsageCard
                    title="You've"
                    value={imageAttachmentCount}
                    subtitle="image(s) attached with the prompt"
                    icon={<ImageIcon className="w-8 h-8 text-green-500 dark:text-green-400" />}
                  />
                  <UsageCard
                    title="You've"
                    value={videoAttachmentCount}
                    subtitle="video(s) attached with the prompt"
                    icon={<Video className="w-8 h-8 text-red-500 dark:text-red-400" />}
                  />
                  <UsageCard
                    title="You've"
                    value={pdfAttachmentCount}
                    subtitle="PDF(s) attached with the prompt"
                    icon={<FileText className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />}
                  />
                  <UsageCard
                    title="You've"
                    value={5}
                    subtitle="image captured (within app) and attached to the prompts"
                    icon={<ScanSearch className="w-8 h-8 text-orange-500 dark:text-orange-400" />}
                  />
                  <UsageCard
                    title="You've"
                    value={123} 
                    subtitle="times you stopped the AI's response"
                    icon={<CircleStop className="w-8 h-8 text-red-500 dark:text-red-400" />}
                  />
                  <UsageCard
                    title="You've"
                    value={10} 
                    subtitle="messages with custom instructions feature"
                    icon={<UserCog className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
                  />
                  <UsageCard
                    title="You've"
                    value={7} 
                    subtitle="times quoted AI reply"
                    icon={<MessageCircleReply className="w-8 h-8 text-teal-500 dark:text-teal-400" />}
                  />
                  </div>
                <br/>
                <NetworkLocationCard locationData={locationData} />
              </div>

              {/* New tool usage cards */}
              <div className="col-span-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tool Usage Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ToolUsageCard
                    icon={<Brain className="w-8 h-8" />}
                    title="Your memory"
                    value={toolUsageData.bio}
                    subtitle="times saved"
                  />
                  <ToolUsageCard
                    icon={<Code className="w-8 h-8" />}
                    title="You've used"
                    value={toolUsageData.python}
                    subtitle="times Code Interpreter"
                  />
                  <ToolUsageCard
                    icon={<Globe className="w-8 h-8" />}
                    title="ChatGPT browsed the internet"
                    value={toolUsageData.browser}
                    subtitle="times for response"
                  />
                  <ToolUsageCard
                    icon={<LinkIcon className="w-8 h-8" />}
                    title="ChatGPT Accessed"
                    value={toolUsageData.webpage}
                    subtitle="webpages for search response"
                  />
                </div>
              </div>
            </div>
          )}
          {mode === 'token' && (
            <>
              {/* Summary Cards for Tokens and Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <SummaryCard title="Tokens" data={totals.tokens} />
                <SummaryCard title="Cost" data={totals.cost} />
              </div>

                {/* Token Usage Bar Chart and Cost Line Chart */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-8">
                  <div>
                    <TokenUsageBarChart 
                      data={tokenUsageData} 
                      year={selectedYear} 
                      onYearChange={setSelectedYear} 
                    />
                  </div>

                  <div>
                    <CostLineChart 
                      data={tokenUsageData} 
                      year={selectedYear} 
                      onYearChange={setSelectedYear} 
                    />
                  </div>
                </div>

                {/* <div className="flex items-start justify-end pb-6">
                      <PlanSelector selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} />
                   </div> */}

            <div className="flex items-center justify-end pb-6 space-x-2">
              <label className="text-md font-medium text-black dark:text-gray-200">
                Select your current plan:
              </label>
              <PlanSelector selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} />
            </div>

                {/* Monthly Token Usage Cards */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(tokenUsageData).map(([month, data]) => (
                    <TokenUsageCard key={month} month={month} data={data} selectedPlan={selectedPlan} />
                  ))}
                </div>
              </>
            )}
        </div>
      </div>
    </>
  )
}
