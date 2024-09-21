'use client'

import React, { useState } from 'react';
import { MessageCircle, MessageSquare, Image as ImageIcon, Mic, Calendar, Users, Archive, BarChart2, ChartColumn, FileText, Video, Brain, Code, Globe } from 'lucide-react';
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
    browser: 278
  }

  const locationData = {
    user: { SFO: 2077, LAS: 529, TXL: 130, BOM: 1, SIN: 13, FRA: 17, AMS: 2 },
    assistant: { SFO: 2544, LAS: 702, MEX: 1, LHR: 1, TXL: 184, BOM: 1, SIN: 15, FRA: 17 }
  }

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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
