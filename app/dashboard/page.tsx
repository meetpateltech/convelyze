'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { MessageCircle, MessageSquare, Image as ImageIcon, Mic, Calendar, Users, Archive, BarChart2, ChartColumn, FileText, Video, Brain, Code, Globe, Download, Upload, ScanSearch, CircleStop, Loader, UserCog, MessageCircleReply, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityCalendar from '@/components/dashboard/ActivityCalendar';
import NetworkLocationCard from '@/components/dashboard/NetworkLocationCard';
import MetricCard from '@/components/cards/MetricCard';
import GlassCard from '@/components/cards/GlassCard';
import RoleBasedMessageCount from '@/components/dashboard/RoleBasedMessageCount';
import ShiftWiseMessageCount from '@/components/dashboard/ShiftWiseMessageCount';
import ModelWiseMessageCount from '@/components/dashboard/ModelWiseMessageCount';
import RequestedModelCount from '@/components/dashboard/RequestedModelCount';
import UsageTimeline from '@/components/dashboard/UsageTimeline';
import DefaultModelSlugCount from '@/components/dashboard/DefaultModelSlugCount';
import AIMessageStatus from '@/components/dashboard/AIMessageStatus';
import AICodeStatsCard from '@/components/dashboard/CodeBlockCount';
import UsageCard from '@/components/dashboard/UsageCard';
import ToolUsageCard from '@/components/dashboard/ToolUsageCard';
import Background from '@/components/ui/background';
import { ModeToggle } from '@/components/ModeToggle';
import { ChatGPTDataAnalysis } from '@/lib/ChatGPTDataAnalysis';
import { readJsonFile } from '@/utils/fileProcessor';
import html2canvas from 'html2canvas';
import DashboardImage from '@/components/DashboardImage';
import Link from 'next/link';
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';
import { TokenUsageCard } from '@/components/dashboard/TokenUsageCard';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { formatCurrency } from '@/components/dashboard/TokenDisplay';
import { calculateCost, getPricing } from '@/utils/pricing';
import { TokenUsageBarChart } from '@/components/dashboard/TokenUsageBarChart';
import { CostLineChart } from '@/components/dashboard/CostLineChart';
import UserSystemHintsCard from '@/components/dashboard/UserSystemHintsCard';

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

interface TotalTokens {
  input: number;
  output: number;
  total: number;
}

interface TotalCost {
  input: string;
  output: string;
  total: string;
}

interface Totals {
  tokens: TotalTokens;
  cost: TotalCost;
}

export default function Dashboard() {
  const [mode, setMode] = useState('normal');
  const [timeUnit, setTimeUnit] = useState('D');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<ChatGPTDataAnalysis | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize()
  const [tokenUsageData, setTokenUsageData] = useState<TokenUsageData>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totals, setTotals] = useState<Totals | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [tokenDataCalculated, setTokenDataCalculated] = useState(false);

  // const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      const jsonData = await readJsonFile(file);
      const newAnalysis = new ChatGPTDataAnalysis(jsonData);
      setAnalysis(newAnalysis);

      const newDashboardData = {
        totalConversations: newAnalysis.getTotalConversations(),
        totalGPTConversations: newAnalysis.getTotalGPTsConversations(),
        totalMessages: newAnalysis.getTotalMessages(),
        totalGPTMessages: newAnalysis.getTotalGPTsMessages(),
        mostChattyDay: newAnalysis.getMostChattyDay(),
        timeSpentOnChatGPT: newAnalysis.getTimeSpentOnChatGPT(),
        averageDailyMessageCount: newAnalysis.getAverageDailyMessageCount(),
        totalArchivedConversations: newAnalysis.getTotalArchivedConversations(),
        totalVoiceMessages: newAnalysis.getTotalVoiceMessages(),
        totalImagesGenerated: newAnalysis.getDALLEImageCount() + newAnalysis.getDALLEImageCountWithoutGizmo(),
        roleBasedMessageData: {
          overall: newAnalysis.getRoleBasedMessageCount(),
          gpts: newAnalysis.getRoleBasedGPTsMessageCount(),
          voice: newAnalysis.getRoleBasedVoiceMessageCount()
        },
        shiftWiseMessageData: newAnalysis.getShiftWiseMessageCount(),
        modelWiseMessageData: newAnalysis.getModelWiseMessageCount(),
        usageTimelineData: newAnalysis.getFirstAndLastUsedDate(),
        defaultModelSlugData: newAnalysis.getDefaultModelSlugCount(),
        aiMessageStatusData: newAnalysis.getStatusCount(),
        modelAdjustmentsCount: newAnalysis.getModelAdjustmentsCount(),
        userAttachmentMimeTypeCount: newAnalysis.getUserAttachmentMimeTypeCount(),
        toolUsageData: newAnalysis.getToolNameCount(),
        locationData: newAnalysis.getLocationCodes(),
        finishDetailData: newAnalysis.getFinishDetailsTypeCount(),
        requestedModelData: newAnalysis.getRequestedModelCount(),
        codeBlockCount: newAnalysis.getAssistantGeneratedCodeBlockCount(),
        customInstructionCount: newAnalysis.getCustomInstructionMessageCount(),
        targetedReplyCount: newAnalysis.getUserTargetedReplyCount(),
        systemsHintCount: newAnalysis.getUserSystemHintsCount(),
        webpageCount: newAnalysis.getWebpageCount(),
      };

      setDashboardData(newDashboardData);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      /* router.push('?success=true', { scroll: false }); */
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please upload the correct file. If you still face issues, create an issue on GitHub.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/json': ['.json'] },
    multiple: false, });

  const getTimeSpentValue = () => {
    if (!dashboardData) return '';
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

  const exportImage = useCallback(() => {
    const dashboardImageElement = document.getElementById('dashboard-image');
    if (dashboardImageElement) {
      html2canvas(dashboardImageElement).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'chatgpt-dashboard.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  }, []);

  const calculateTotals = (data: TokenUsageData): Totals => {
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

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  useEffect(() => {
    if (mode === 'token' && analysis && !tokenDataCalculated) {
      setIsTokenLoading(true);
      // Delay the token calculations to prevent UI lag
      const timer = setTimeout(() => {
        try {
          const newTokenUsageData = analysis.getMonthlyModelWiseTokenUsage();
          setTokenUsageData(newTokenUsageData);
          const newTotals: Totals = calculateTotals(newTokenUsageData);
          setTotals(newTotals);
          setTokenDataCalculated(true);
        } catch (error) {
          console.error('Error calculating token usage:', error);
          toast.error('Error counting tokens. Please try again.');
        } finally {
          setIsTokenLoading(false);
        }
      }, 100); // 100ms delay
  
      return () => clearTimeout(timer);
    }
  }, [mode, analysis, tokenDataCalculated]);

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    if (newMode === 'token' && !tokenDataCalculated) {
      setIsTokenLoading(true);
    }
  };

  return (
    <>
      <Background />
      {showConfetti && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}>
           <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={300}
            />
          </div>
        )}
      <div className="relative z-20 min-h-screen transition-colors duration-300 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            <Link href="/">Convelyze</Link>
          </h1>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              {dashboardData && (
                <>
                {mode === 'normal' && (
                    <Button onClick={exportImage} variant="link" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export PNG
                    </Button>
                  )}
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
                      Advanced
                    </Button>
                    <Button
                      variant={mode === 'token' ? 'secondary' : 'ghost'}
                      className={`rounded-full px-3 py-1 ${mode === 'token' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-800 dark:text-white'}`}
                      onClick={() => handleModeChange('token')}
                    >
                      Tokens
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {dashboardData && (
            <>
              <div style={{ position: 'absolute', left: '-9999px' }}>
                <div id="dashboard-image">
                  <DashboardImage data={dashboardData} />
                </div>
              </div>
            </>
          )}

          {!dashboardData ? (
            <div className="flex items-center justify-center min-h-screen">
            <div
              {...getRootProps()}
              className={`w-full max-w-md p-8 transition-all duration-300 ease-in-out transform 
                          ${
                            isDragActive
                              ? 'scale-105 bg-white/40 dark:bg-gray-800/40 border-black/30 dark:border-white/30'
                              : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/35 dark:hover:bg-gray-800/35 border-black/20 dark:border-white/20'
                          } 
                          backdrop-blur-md border-2 border-dashed rounded-xl shadow-lg cursor-pointer`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                <Upload
                  size={48}
                  className={`${
                    isDragActive ? 'text-black dark:text-white' : 'text-black/70 dark:text-white/70'
                  } transition-colors duration-300`}
                />
                <div className="text-center">
                  {isDragActive ? (
                    <p className="text-lg font-semibold text-black dark:text-white">
                      Drop the file here!
                    </p>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-black dark:text-white">
                        Drag &apos;n&apos; drop your file here
                      </p>
                      <p className="mt-1 text-sm text-black/70 dark:text-white/70">
                        or click to select a file
                      </p>
                    </>
                  )}
                </div>
                <FileText size={24} className="text-black/70 dark:text-white/70" />
                <p className="text-xs text-black/70 dark:text-white/70">
                  Accepts conversation.json files
                </p>
              </div>
            </div>
          </div>
          ) : (
            <>
              {mode === 'normal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    title="Total GPTs Used"
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
                                ? 'bg-teal-500 text-white dark:bg-teal-600' 
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
                  
                  <GlassCard className="col-span-full">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Activity Calendar</h3>
                    <ActivityCalendar data={analysis?.getDateWiseActivity() || {}} />
                  </GlassCard>
                </div>
              )}

              {mode === 'advanced' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RoleBasedMessageCount data={dashboardData.roleBasedMessageData} />
                  <ShiftWiseMessageCount data={dashboardData.shiftWiseMessageData} />
                  <ModelWiseMessageCount data={dashboardData.modelWiseMessageData} />
                  <RequestedModelCount data={dashboardData.requestedModelData} />
                  <UsageTimeline data={dashboardData.usageTimelineData} />
                  <DefaultModelSlugCount data={dashboardData.defaultModelSlugData} />
                  <AIMessageStatus data={dashboardData.aiMessageStatusData} />

                  <div className="col-span-full">
                  <AICodeStatsCard codeBlockCount={dashboardData.codeBlockCount} />
                  </div>

                  <div className="col-span-full">
                  <UserSystemHintsCard data={dashboardData.systemsHintCount} />
                  </div>
                   
                  <div className="col-span-full">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usage Statistics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <UsageCard
                        title="You've hit"
                        value={dashboardData.modelAdjustmentsCount['auto:smaller_model:reached_message_cap'] || 0}
                        subtitle="times reached the message cap and continued with a smaller model"
                        icon={<MessageCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />}
                      />
                      <UsageCard
                        title="You've"
                        value={Object.entries(dashboardData.userAttachmentMimeTypeCount)
                          .filter(([key]) => key.startsWith('image/'))
                          .reduce((sum, [, value]) => sum + (value as number), 0)}
                        subtitle="image(s) attached to the prompt"
                        icon={<ImageIcon className="w-8 h-8 text-green-500 dark:text-green-400" />}
                      />
                      <UsageCard
                        title="You've"
                        value={Object.entries(dashboardData.userAttachmentMimeTypeCount)
                          .filter(([key]) => key.startsWith('video/'))
                          .reduce((sum, [, value]) => sum + (value as number), 0)}
                        subtitle="video(s) attached to the promptweb"
                        icon={<Video className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />}
                      />
                      <UsageCard
                        title="You've"
                        value={dashboardData.userAttachmentMimeTypeCount['application/pdf'] || 0}
                        subtitle="PDF(s) attached to the prompt"
                        icon={<FileText className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />}
                      />
                      <UsageCard
                        title="You've"
                        value={dashboardData.userAttachmentMimeTypeCount['application/octet-stream'] || 0}
                        subtitle="image captured (within app) and attached to the prompts"
                        icon={<ScanSearch className="w-8 h-8 text-orange-500 dark:text-orange-400" />}
                      />
                      <UsageCard
                        title="You've"
                        value={dashboardData.finishDetailData['interrupted'] || 0}
                        subtitle="times you stopped the AI's response"
                        icon={<CircleStop className="w-8 h-8 text-red-500 dark:text-red-400" />}
                      />
                      <UsageCard
                        title="You've"
                        value={dashboardData.customInstructionCount || 0}
                        subtitle="messages with custom instructions feauture"
                        icon={<UserCog className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
                      />
                      <UsageCard
                        title="You've"
                        value={dashboardData.targetedReplyCount || 0}
                        subtitle="times quoted AI reply"
                        icon={<MessageCircleReply className="w-8 h-8 text-teal-500 dark:text-teal-400" />}
                      />
                    </div>
                    <br/>
                    <NetworkLocationCard locationData={dashboardData.locationData} />
                  </div>

                  <div className="col-span-full">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tool Usage Statistics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ToolUsageCard
                        icon={<Brain className="w-8 h-8" />}
                        title="Your memory"
                        value={dashboardData.toolUsageData['bio'] || 0}
                        subtitle="times saved"
                      />
                      <ToolUsageCard
                        icon={<Code className="w-8 h-8" />}
                        title="You've used"
                        value={dashboardData.toolUsageData['python'] || 0}
                        subtitle="times Code Interpreter"
                      />
                      <ToolUsageCard
                        icon={<Globe className="w-8 h-8" />}
                        title="ChatGPT browsed the internet"
                        value={(dashboardData.toolUsageData['browser'] || 0) + (dashboardData.toolUsageData['web'] || 0)}
                        subtitle="times for response"
                      />
                      <ToolUsageCard
                        icon={<LinkIcon className="w-8 h-8" />}
                        title="ChatGPT Accessed"
                        value={dashboardData.webpageCount || 0}
                        subtitle="webpages for search response"
                      />
                    </div>
                  </div>
                </div>
              )}

              {mode === 'token' && (
                <>
                  {isTokenLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Loader className="w-8 h-8 animate-spin text-primary" />
                      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                        Calculating token usage...
                      </p>
                      <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
                        this might take a little time, thanks for your patience!
                      </p>
                    </div>
                  ) : totals ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <SummaryCard title="Tokens" data={totals.tokens} />
                        <SummaryCard title="Cost" data={totals.cost} />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-8">
                        <div>
                          <TokenUsageBarChart data={tokenUsageData} year={selectedYear} onYearChange={handleYearChange} />
                        </div>
                        
                        <div>
                          <CostLineChart data={tokenUsageData} year={selectedYear} onYearChange={handleYearChange} />
                        </div>
                      </div>
                      
                      {/* Monthly Token Usage Cards */}
                      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(tokenUsageData).map(([month, data]) => (
                          <TokenUsageCard key={month} month={month} data={data} />
                        ))}
                      </div>
                    </>
                  ) : null}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
