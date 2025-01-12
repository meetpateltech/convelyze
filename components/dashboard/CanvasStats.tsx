import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Smile, Edit2, Sparkles, GraduationCap, Ruler, MessageSquare, Terminal, Bug, GitPullRequest, Code, LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ReviewStats {
  reviews: number
  comments: number
}

interface CodeStats {
  comments: {
    total: number
    [key: string]: number
  }
  logs: {
    total: number
    [key: string]: number
  }
  fixBugs: {
    total: number
    [key: string]: number
  }
  review: {
    total: ReviewStats
    [key: string]: ReviewStats
  }
  port: {
    total: number
    php: number
    cpp: number
    python: number
    javascript: number
    typescript: number
    java: number
  }
}

interface CanvasStatsProps {
  documentStats: {
    emoji: { total: number, words: number, sections: number, lists: number, remove: number }
    suggestEdits: { totalSuggestEdits: number, totalCommentsAdded: number }
    polish: number
    readingLevel: {
      total: number
      graduate: number
      college: number
      highSchool: number
      middleSchool: number
      kindergarten: number
    }
    length: { total: number, longest: number, longer: number, shorter: number, shortest: number }
  }
  codeStats: CodeStats
}

const StatBox = ({
  icon: Icon,
  title,
  total,
  subtitle,
  iconColor,
  hoverGlow,
  children
}: {
  icon: LucideIcon
  title: string
  total: number
  subtitle?: string
  iconColor: string
  hoverGlow: string
  children?: React.ReactNode
}) => (
  <Card className={`group relative overflow-hidden w-full bg-white/30 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-200/50 dark:border-white/10 transition-all duration-300 hover:border-gray-300/70 dark:hover:border-white/20 hover:bg-white/50 dark:hover:bg-white/[0.07]`}>
    <div className="relative p-6 space-y-4 z-10">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/80 
            group-hover:text-gray-900 dark:group-hover:text-white/90">{title}</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white/90 
            group-hover:text-black dark:group-hover:text-white">{total} times</div>
          {subtitle && <p className="text-sm text-gray-600 dark:text-white/60 
            group-hover:text-gray-700 dark:group-hover:text-white/70">{subtitle}</p>}
        </div>
        <div className="relative inline-block">
            <div className={`absolute inset-0 ${hoverGlow} blur-xl 
            scale-150 opacity-0 group-hover:opacity-100 
            transition-opacity duration-500`}>
          </div>
           <div className={`relative z-10 ${iconColor}
            transition-transform duration-500 ease-out 
            group-hover:scale-110 group-hover:-rotate-12`}>
              <Icon className="w-7 h-7 text-gray-700 dark:text-white/80 
                group-hover:text-gray-900 dark:group-hover:text-white" />
          </div>
        </div>
      </div>
      {children && (
        <div className="pt-4 space-y-2">
          {children}
        </div>
      )}
    </div>
     <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
      bg-gradient-to-r from-transparent via-gray-100/50 dark:via-white/[0.02] to-transparent
      blur-sm transition-opacity duration-500">
    </div>
    <div className={`absolute -z-10 inset-0 rounded-2xl 
      transition-transform duration-500 group-hover:scale-105 
      opacity-0 group-hover:opacity-100 ${hoverGlow}`}>
    </div>
  </Card>
)

const StatItem = ({ label, value }: { label: string, value: number }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600 dark:text-white/60 
      group-hover:text-gray-700 dark:group-hover:text-white/70">{label}</span>
    <span className="font-semibold text-gray-800 dark:text-white/80 
      group-hover:text-gray-900 dark:group-hover:text-white">{value}</span>
  </div>
)

const renderLanguageStats = (stats: { [key: string]: number }, excludeTotal: boolean = false) => {
  return Object.entries(stats)
    .filter(([key]) => !excludeTotal || key !== 'total')
    .map(([language, value]) => (
      <StatItem 
        key={language} 
        label={language.charAt(0).toUpperCase() + language.slice(1)} 
        value={value} 
      />
    ))
}

const LanguageStatRow = ({ language, stats }: { language: string, stats: ReviewStats }) => {
  
  const capitalizedLang = language.charAt(0).toUpperCase() + language.slice(1)
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/10 last:border-0">
      <div className="flex items-center space-x-2">
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white/90">
          {capitalizedLang}
        </span>
      </div>
      <div className="flex items-center space-x-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <GitPullRequest className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{stats.reviews}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="left"
              align="end"
              sideOffset={5}
              alignOffset={5}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-white/10"
            >
              <p className="text-sm text-gray-900 dark:text-white/90">
                Code reviews used for {capitalizedLang}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">{stats.comments}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="left"
              align="end"
              sideOffset={5}
              alignOffset={5}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-white/10"
            >
              <p className="text-sm text-gray-900 dark:text-white/90">
                Review comments added for {capitalizedLang}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export function CanvasStats({ documentStats, codeStats }: CanvasStatsProps) {
  const [activeTab, setActiveTab] = useState('text')

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white/90">Canvas Stats</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-[400px]">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-white/10 backdrop-blur-sm rounded-full p-1">
            <TabsTrigger value="text"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/20 rounded-full transition-all duration-300">
              Text Document
            </TabsTrigger>
            <TabsTrigger value="code"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/20 rounded-full transition-all duration-300">
              Codeblock
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'text' ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox
              icon={Smile}
              title="Add emojis used"
              total={documentStats.emoji.total}
              iconColor="text-yellow-500"
              hoverGlow="bg-yellow-500/20"
            >
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Words" value={documentStats.emoji.words} />
                <StatItem label="Sections" value={documentStats.emoji.sections} />
                <StatItem label="Lists" value={documentStats.emoji.lists} />
                <StatItem label="Removed" value={documentStats.emoji.remove} />
              </div>
            </StatBox>

            <StatBox
              icon={Sparkles}
              title="Add Final Polish used"
              total={documentStats.polish}
              iconColor="text-pink-500"
              hoverGlow="bg-pink-500/20"
            />

            <StatBox
              icon={Edit2}
              title="Suggest Edits used"
              total={documentStats.suggestEdits.totalSuggestEdits}
              subtitle={`${documentStats.suggestEdits.totalCommentsAdded} comments added`}
              iconColor="text-blue-500"
              hoverGlow="bg-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatBox
              icon={GraduationCap}
              title="Reading Level used"
              total={documentStats.readingLevel.total}
              iconColor="text-emerald-500"
              hoverGlow="bg-emerald-500/20"
            >
              <div className="space-y-2">
                <StatItem label="Graduate" value={documentStats.readingLevel.graduate} />
                <StatItem label="College" value={documentStats.readingLevel.college} />
                <StatItem label="High School" value={documentStats.readingLevel.highSchool} />
                <StatItem label="Middle School" value={documentStats.readingLevel.middleSchool} />
                <StatItem label="Kindergarten" value={documentStats.readingLevel.kindergarten} />
              </div>
            </StatBox>

            <StatBox
              icon={Ruler}
              title="Adjust the length used"
              total={documentStats.length.total}
              iconColor="text-red-500"
              hoverGlow="bg-red-500/20"
            >
              <div className="space-y-2">
                <StatItem label="Longest" value={documentStats.length.longest} />
                <StatItem label="Longer" value={documentStats.length.longer} />
                <StatItem label="Shorter" value={documentStats.length.shorter} />
                <StatItem label="Shortest" value={documentStats.length.shortest} />
              </div>
            </StatBox>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox
              icon={MessageSquare}
              title="Add Comments used"
              total={codeStats.comments.total}
              iconColor="text-blue-500"
              hoverGlow="bg-blue-500/20"
            >
              {renderLanguageStats(codeStats.comments, true)}
            </StatBox>

            <StatBox
              icon={Terminal}
              title="Add Logs used"
              total={codeStats.logs.total}
              iconColor="text-gray-500"
              hoverGlow="bg-gray-500/20"
            >
              {renderLanguageStats(codeStats.logs, true)}
            </StatBox>

            <StatBox
              icon={Bug}
              title="Add Bug Fixes used"
              total={codeStats.fixBugs.total}
              iconColor="text-red-500"
              hoverGlow="bg-red-500/20"
            >
              {renderLanguageStats(codeStats.fixBugs, true)}
            </StatBox>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatBox
              icon={GitPullRequest}
              title="Code Reviews used"
              total={codeStats.review.total.reviews}
              iconColor="text-purple-500"
              hoverGlow="bg-purple-500/20"
            >
              <div className="space-y-1">
                {Object.entries(codeStats.review)
                  .filter(([key]) => key !== 'total')
                  .map(([language, stats]) => (
                    <LanguageStatRow 
                      key={language}
                      language={language}
                      stats={stats}
                    />
                  ))}
              </div>
            </StatBox>

            <StatBox
              icon={Code}
              title="Code Ports used"
              total={codeStats.port.total}
              iconColor="text-emerald-500"
              hoverGlow="bg-emerald-500/20"
            >
              <StatItem label="PHP" value={codeStats.port.php} />
              <StatItem label="Java" value={codeStats.port.java} />
              <StatItem label="JavaScript" value={codeStats.port.javascript} />
              <StatItem label="Python" value={codeStats.port.python} />
              <StatItem label="TypeScript" value={codeStats.port.typescript} />
              <StatItem label="C++" value={codeStats.port.cpp} />
            </StatBox>
          </div>
        </div>
      )}
    </div>
  )
}