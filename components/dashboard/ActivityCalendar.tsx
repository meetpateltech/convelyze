'use client'

import React, { useState, useMemo, useRef } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DayData {
  totalMessages: number
  totalConversations: number
}

interface CalendarData {
  [date: string]: DayData
}

interface ActivityCalendarProps {
  data: CalendarData
}

const GlassCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-filter backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 dark:border-white/10 ${className}`}>
    {children}
  </div>
)

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const calendarRef = useRef<HTMLDivElement>(null)

  const years = useMemo(() => {
    const yearsSet: { [key: number]: boolean } = {}
    Object.keys(data).forEach(date => {
      const year = new Date(date).getFullYear()
      yearsSet[year] = true
    })
    return Object.keys(yearsSet).map(Number).sort((a, b) => b - a)
  }, [data])

  const filteredData = useMemo(() => {
    return Object.keys(data).reduce((acc, date) => {
      if (new Date(date).getFullYear() === selectedYear) {
        acc[date] = data[date]
      }
      return acc
    }, {} as CalendarData)
  }, [data, selectedYear])

  const totalContributions = useMemo(() => {
    return Object.values(filteredData).reduce((sum, day) => sum + day.totalMessages, 0)
  }, [filteredData])

  const maxActivity = useMemo(() => {
    return Math.max(...Object.values(filteredData).map(d => d.totalMessages))
  }, [filteredData])

  const getColor = (activity: number) => {
    if (activity === 0) return 'bg-gray-200/20 dark:bg-gray-700/20'

    const intensity = activity / maxActivity
    if (intensity > 0.66) return 'bg-green-600'
    if (intensity > 0.33) return 'bg-green-400'
    return 'bg-green-200'
  }

  const renderCalendar = () => {
    const startDate = new Date(selectedYear, 0, 1)
    const endDate = new Date(selectedYear, 11, 31)
    const calendar = []

    let weekIndex = 0
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0]
      const dayData = filteredData[dateString] || { totalMessages: 0, totalConversations: 0 }
      
      if (date.getDay() === 0) weekIndex++
      
      calendar.push(
        <TooltipProvider key={dateString}>
          <Tooltip>
            <TooltipTrigger>
              <div
                className={`w-full h-full rounded-sm ${getColor(dayData.totalMessages)}`}
                style={{ 
                  gridColumn: weekIndex,
                  gridRow: date.getDay() + 1
                }}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
              <p className="font-bold">{dateString}</p>
              <p>{dayData.totalMessages} messages</p>
              <p>{dayData.totalConversations} conversations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return calendar
  }

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <GlassCard className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{totalContributions} responses in the {selectedYear}</h2>
        <div className="flex items-center gap-2">
          {/* Removed zoom buttons */}
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto pb-4" ref={calendarRef}>
        <div className="flex flex-col w-full" style={{ minWidth: '800px' }}>
          <div className="flex mb-1 text-xs text-gray-500 dark:text-gray-400">
            {monthLabels.map((month, index) => (
              <span key={month} className="flex-1 text-left" style={{ paddingLeft: index === 0 ? '0' : '8px' }}>{month}</span>
            ))}
          </div>
          <div className="w-full aspect-[53/7]">
            <div className="grid grid-rows-7 grid-flow-col gap-1 h-full" style={{ gridAutoColumns: "minmax(0, 1fr)" }}>
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default ActivityCalendar;