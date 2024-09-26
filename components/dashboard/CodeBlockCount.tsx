"use client"

import React, { useState } from 'react'
import { Code2, ChevronDown, ChevronUp } from 'lucide-react'
import * as DevIcons from 'devicons-react'

interface AICodeStatsCardProps {
  codeBlockCount: Record<string, number>
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/10 dark:bg-black/10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 dark:border-white/10 transition-all duration-300 ${className}`}>
    {children}
  </div>
)

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
}

const LanguageBox: React.FC<{ language: string; count: number }> = ({ language, count }) => {
  const iconName = languageIconMap[language.toLowerCase()] || `${language.charAt(0).toUpperCase() + language.slice(1)}Original`
  const IconComponent = (DevIcons as any)[iconName]

  const displayName = language

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
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{displayName}</h3>
    </div>
  )
}

const AICodeStatsCard: React.FC<AICodeStatsCardProps> = ({ codeBlockCount }) => {
  const [showAll, setShowAll] = useState(false)
  const sortedLanguages = Object.entries(codeBlockCount).sort((a, b) => b[1] - a[1])
  const totalCount = Object.values(codeBlockCount).reduce((sum, count) => sum + count, 0)

  const displayLanguages = showAll ? sortedLanguages : sortedLanguages.slice(0, 10)
  const otherLanguages = sortedLanguages.slice(10)
  const otherCount = otherLanguages.reduce((sum, [, count]) => sum + count, 0)

  if (!showAll && otherCount > 0) {
    displayLanguages.push(['Other', otherCount])
  }

  return (
    <div className="relative">
      <GlassCard className="overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">AI Generated Code Blocks</h2>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 blur-md opacity-50"></div>
            <Code2 className="w-10 h-10 text-blue-500 dark:text-blue-400 relative z-10 animate-pulse" />
          </div>
        </div>
        <div className="flex space-x-6">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center">
              <Code2 className="w-6 h-6 mr-3 text-blue-400" />
              Languages ({totalCount} blocks)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayLanguages.map(([language, count]) => (
                <LanguageBox
                  key={language}
                  language={language}
                  count={count}
                />
              ))}
            </div>
            {sortedLanguages.length > 10 && (
              <button
                className="mt-8 flex items-center justify-center w-full py-3 px-6 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-gray-800 dark:text-gray-200 rounded-xl backdrop-filter backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 dark:border-white/10 group"
                onClick={() => setShowAll(!showAll)}
              >
                <span className="mr-2">{showAll ? 'Show Less' : 'Show All'}</span>
                {showAll ? (
                  <ChevronUp className="w-5 h-5 text-blue-500 group-hover:transform group-hover:-translate-y-1 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-500 group-hover:transform group-hover:translate-y-1 transition-transform duration-300" />
                )}
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default AICodeStatsCard