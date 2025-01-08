"use client"

import React, { useState } from 'react'
import { Code2, ChevronDown, ChevronUp } from 'lucide-react'
import * as DevIcons from 'devicons-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AICodeStatsCardProps {
  codeBlockCount: Record<string, number>
  canvasCodeBlockCount: { total: number; [lang: string]: number }
}

const languageIconMap: Record<string, keyof typeof DevIcons> = {
  javascript: 'JavascriptOriginal',
  typescript: 'TypescriptOriginal',
  tsx: 'TypescriptOriginal',
  jsx: 'ReactOriginal',
  js: 'JavascriptOriginal',
  python: 'PythonOriginal',
  java: 'JavaOriginal',
  csharp: 'CsharpOriginal',
  cpp: 'CplusplusOriginal',
  php: 'PhpOriginal',
  ruby: 'RubyOriginal',
  go: 'GoOriginal',
  rust: 'RPlain',
  swift: 'SwiftOriginal',
  kotlin: 'KotlinOriginal',
  dart: 'DartOriginal',
  html: 'Html5Original',
  css: 'Css3Original',
  scss: 'SassOriginal',
  sql: 'MysqlOriginal',
  shell: 'BashOriginal',
  dockerfile: 'DockerOriginal',
  yaml: 'YamlPlain',
  json: 'JsonOriginal',
  markdown: 'MarkdownOriginal',
  sh: 'BashOriginal',
  ts: 'TypescriptOriginal',
}

const LanguageBox: React.FC<{ language: string; count: number }> = ({ language, count }) => {
  const iconName = languageIconMap[language.toLowerCase()] || `${language.charAt(0).toUpperCase() + language.slice(1)}Original`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (DevIcons as any)[iconName]

  return (
    <div className="bg-white/5 dark:bg-black/5 backdrop-filter backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/10 dark:border-white/5 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 group flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        {IconComponent ? (
          <IconComponent className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <Code2 className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
        )}
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{count}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{language}</h3>
    </div>
  )
}

const AICodeStatsCard: React.FC<AICodeStatsCardProps> = ({ codeBlockCount, canvasCodeBlockCount }) => {
  const [showAll, setShowAll] = useState(false)

  const renderLanguageStats = (data: Record<string, number>) => {
    const sortedLanguages = Object.entries(data)
      .filter(([key]) => key !== 'total')
      .sort((a, b) => b[1] - a[1])
    
    const totalCount = data.total || Object.values(data).reduce((sum, count) => sum + count, 0)
    const displayLanguages = showAll ? sortedLanguages : sortedLanguages.slice(0, 10)
    const otherLanguages = sortedLanguages.slice(10)
    const otherCount = otherLanguages.reduce((sum, [, count]) => sum + count, 0)

    if (!showAll && otherCount > 0) {
      displayLanguages.push(['Other', otherCount])
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Code2 className="w-6 h-6 mr-3 text-blue-400" />
          <span className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Languages ({totalCount} blocks)
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayLanguages.map(([language, count]) => (
            <LanguageBox key={language} language={language} count={count} />
          ))}
        </div>

        {sortedLanguages.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-3 px-6 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 rounded-xl backdrop-blur-sm transition-all duration-300 border border-white/20 dark:border-white/10 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
          >
            {showAll ? 'Show Less' : 'Show All'}
            {showAll ? (
              <ChevronUp className="w-5 h-5 text-blue-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-500" />
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg p-8 border border-white/20 dark:border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          AI Generated Code Blocks
        </h2>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 blur-md opacity-50" />
          <Code2 className="relative z-10 w-10 h-10 text-blue-500 dark:text-blue-400 animate-pulse" />
        </div>
      </div>

      <Tabs defaultValue="normal" className="w-full">
        <TabsList>
        <TabsTrigger 
            value="normal" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/20 rounded-full transition-all duration-300"
          >
            Normal
          </TabsTrigger>
          <TabsTrigger 
            value="canvas" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/20 rounded-full transition-all duration-300"
          >
            Canvas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="normal">
          {renderLanguageStats(codeBlockCount)}
        </TabsContent>
        
        <TabsContent value="canvas">
          {renderLanguageStats(canvasCodeBlockCount)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AICodeStatsCard