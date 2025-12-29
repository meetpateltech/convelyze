"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { formatModelName, getModelColor, cn } from "@/lib/utils";
import { ChatGPTDataAnalysis } from "@/lib/ChatGPTDataAnalysis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper function to get week start date (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Calculate weekly model usage from pre-computed weekly usage data
function calculateWeeklyModelUsage(
  weeklyUsage: Array<{
    weekKey: string;
    date: Date;
    modelUsage: Record<string, number>;
  }>,
  selectedYear: number | null
) {
  if (weeklyUsage.length === 0) return [];

  // Filter by year if selectedYear is not null (all time mode)
  const filteredWeeklyUsage = selectedYear !== null
    ? weeklyUsage.filter(weekData => {
        return weekData.date.getFullYear() === selectedYear;
      })
    : weeklyUsage;

  if (filteredWeeklyUsage.length === 0) return [];

  const timelineData: Array<{
    date: Date;
    weekKey: string;
    rankings: Array<{
      model: string;
      rank: number;
      score: number;
      modelSlug: string;
    }>;
  }> = [];

  // Find max count across all weeks for normalization
  let maxCount = 0;
  filteredWeeklyUsage.forEach((weekData) => {
    const counts = Object.values(weekData.modelUsage);
    if (counts.length > 0) {
      const weekMax = Math.max(...counts, 0);
      maxCount = Math.max(maxCount, weekMax);
    }
  });

  if (maxCount === 0) return [];

  filteredWeeklyUsage.forEach((weekData) => {
    const { weekKey, date, modelUsage } = weekData;
    if (Object.keys(modelUsage).length === 0) return;

    const rankings = Object.entries(modelUsage)
      .filter(([modelSlug]) => modelSlug)
      .map(([modelSlug, count]) => {
        const normalizedScore = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return {
          model: formatModelName(modelSlug),
          modelSlug,
          rank: 0,
          score: normalizedScore,
        };
      })
      .sort((a, b) => b.score - a.score);

    rankings.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    timelineData.push({
      date,
      weekKey,
      rankings: rankings.map(({ model, rank, score, modelSlug }) => ({
        model,
        rank,
        score,
        modelSlug,
      })),
    });
  });

  return timelineData;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getWeekLabel(date: Date, showYear: boolean = false) {
  const weekStart = getWeekStart(date);
  const yearLabel = showYear ? ` ${weekStart.getFullYear()}` : "";
  return `Week of ${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}${yearLabel}`;
}

const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn("animate-spin", className)} />
);

const GlassButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "default" | "icon" }
>(({ className, children, size = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex items-center justify-center transition-all duration-200 bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-lg hover:bg-white/30 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed",
      size === "icon" ? "w-10 h-10" : "px-4 py-2",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
GlassButton.displayName = "GlassButton";

interface ModelEvolutionProps {
  analysis: ChatGPTDataAnalysis | null;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

export function ModelEvolution({ analysis, selectedYear, onYearChange }: ModelEvolutionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxRenderedIndex, setMaxRenderedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    model: string;
  } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use ResizeObserver for accurate width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset indices when analysis or year changes
  useEffect(() => {
    setCurrentIndex(0);
    setMaxRenderedIndex(0);
    setIsPlaying(true);
  }, [analysis, selectedYear]);

  // Memoize the expensive getWeeklyModelUsage call once
  const weeklyModelUsage = useMemo(() => {
    if (!analysis) return [];
    return analysis.getWeeklyModelUsage();
  }, [analysis]);

  // Extract available years from the memoized result
  const availableYears = useMemo(() => {
    if (weeklyModelUsage.length === 0) return [];
    return Array.from(new Set(weeklyModelUsage.map((u) => u.date.getFullYear()))).sort((a, b) => b - a);
  }, [weeklyModelUsage]);

  // Memoize timeline data calculation
  const timelineData = useMemo(
    () => calculateWeeklyModelUsage(weeklyModelUsage, selectedYear),
    [weeklyModelUsage, selectedYear]
  );

  // Chart layout constants
  const DOT_GAP = 80; // Fixed gap between weeks
  const CHART_HEIGHT = 400;
  const VERTICAL_PADDING = 30;

  // Calculate start date for x-axis positioning
  const startDate = useMemo(() => {
    if (selectedYear !== null) {
      return new Date(Date.UTC(selectedYear, 0, 1));
    }
    // For all-time mode, use the earliest date in the data
    if (timelineData.length > 0) {
      const dates = timelineData.map(d => d.date);
      return new Date(Math.min(...dates.map(d => d.getTime())));
    }
    return new Date();
  }, [selectedYear, timelineData]);

  const getXForDate = useCallback(
    (date: Date) => {
      const start = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
      const diffDays = (current - start) / (1000 * 60 * 60 * 24);
      return (diffDays / 7) * DOT_GAP;
    },
    [startDate]
  );

  // Calculate dimensions - fixed to full year width or all-time range
  const totalWidth = useMemo(() => {
    if (selectedYear !== null) {
      const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      const daysInYear = isLeap(selectedYear) ? 366 : 365;
      return (daysInYear / 7) * DOT_GAP;
    }
    // For all-time mode, calculate based on date range
    if (timelineData.length === 0) return 0;
    const dates = timelineData.map(d => d.date);
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    const diffDays = (latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24);
    // Add some padding for the last week
    return ((diffDays + 7) / 7) * DOT_GAP;
  }, [selectedYear, timelineData]);

  // Memoize getScoreY function
  const getScoreY = useCallback((score: number) => {
    const usableHeight = CHART_HEIGHT - VERTICAL_PADDING * 2;
    return VERTICAL_PADDING + ((100 - score) / 100) * usableHeight;
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || timelineData.length === 0) return;

    const ANIMATION_INTERVAL = 100; // ms between frames

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= timelineData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ANIMATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, timelineData.length]);

  // Optimized scroll handler
  const handleScroll = useCallback(
    (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const delta = Math.sign(e.deltaX);
        setCurrentIndex((prev) => {
          const maxIndex = timelineData.length - 1;
          return Math.max(0, Math.min(maxIndex, prev + delta));
        });

        const SCROLL_DEBOUNCE = 150;
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, SCROLL_DEBOUNCE);
      }
    },
    [timelineData.length]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleScroll, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (currentIndex > maxRenderedIndex) {
      setMaxRenderedIndex(currentIndex);
    }
  }, [currentIndex, maxRenderedIndex]);

  // Calculate translation
  const translateX = useMemo(() => {
    const width = containerWidth || 1400;
    if (!timelineData || timelineData.length === 0 || !timelineData[currentIndex]) {
      return width / 2;
    }
    const currentX = getXForDate(timelineData[currentIndex].date);
    return width / 2 - currentX;
  }, [currentIndex, timelineData, getXForDate, containerWidth]);

  // Get current week data
  const currentData = timelineData[currentIndex];
  const topModel = currentData?.rankings[0]?.model || "";

  // Memoize all unique models and color mapping
  const { allModels, modelColorMap } = useMemo(() => {
    const models = new Set<string>();
    const modelSlugMap: Record<string, string> = {};

    timelineData.forEach((item) => {
      item.rankings.forEach((r) => {
        models.add(r.model);
        if (r.modelSlug) {
          modelSlugMap[r.model] = r.modelSlug;
        }
      });
    });

    const colorMap: Record<string, string> = {};
    models.forEach((modelName) => {
      const modelSlug = modelSlugMap[modelName] || "unknown";
      colorMap[modelName] = getModelColor(modelSlug);
    });

    return { allModels: models, modelColorMap: colorMap };
  }, [timelineData]);

  // Memoize interpolated points
  const interpolatedPoints = useMemo(() => {
    if (!timelineData.length) return [];

    const INTERPOLATION_DENSITY = 11;
    const points: Array<{
      x: number;
      y: number;
      model: string;
      originalIndex: number;
    }> = [];

    Array.from(allModels).forEach((model) => {
      for (let i = 0; i < timelineData.length - 1; i++) {
        const currentData = timelineData[i].rankings.find(
          (r) => r.model === model
        );
        const nextData = timelineData[i + 1].rankings.find(
          (r) => r.model === model
        );

        const startX = getXForDate(timelineData[i].date);
        const endX = getXForDate(timelineData[i + 1].date);

        if (currentData && nextData) {
          const startY = getScoreY(currentData.score);
          const endY = getScoreY(nextData.score);

          const dist = Math.sqrt(
            Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
          );
          const steps = Math.max(1, Math.floor(dist / INTERPOLATION_DENSITY));

          for (let s = 0; s < steps; s++) {
            const t = s / steps;
            points.push({
              x: startX + (endX - startX) * t,
              y: startY + (endY - startY) * t,
              model,
              originalIndex: i + t,
            });
          }
        } else if (currentData) {
          points.push({
            x: startX,
            y: getScoreY(currentData.score),
            model,
            originalIndex: i,
          });
        }
      }

      // Add the last point
      const lastIdx = timelineData.length - 1;
      const lastData = timelineData[lastIdx].rankings.find(
        (r) => r.model === model
      );
      if (lastData) {
        const x = getXForDate(timelineData[lastIdx].date);
        points.push({
          x,
          y: getScoreY(lastData.score),
          model,
          originalIndex: lastIdx,
        });
      }
    });
    return points;
  }, [timelineData, allModels, getXForDate, getScoreY]);

  // Memoize visible points
  const visiblePoints = useMemo(() => {
    const VIEWPORT_BUFFER = 100;
    const width = containerWidth || 1400;

    return interpolatedPoints.filter((point) => {
      // Small epsilon to ensure the point exactly at currentIndex is shown
      if (point.originalIndex > maxRenderedIndex + 0.01) return false;
      const xOnScreen = point.x + translateX;
      return (
        xOnScreen > -VIEWPORT_BUFFER &&
        xOnScreen < width + VIEWPORT_BUFFER
      );
    });
  }, [interpolatedPoints, maxRenderedIndex, translateX, containerWidth]);

  // Memoize month markers
  const monthMarkers = useMemo(() => {
    const markers: Array<{ x: number; label: string }> = [];
    
    if (selectedYear !== null) {
      // Single year mode - show all 12 months
      for (let m = 0; m < 12; m++) {
        const date = new Date(Date.UTC(selectedYear, m, 1));
        markers.push({
          x: getXForDate(date),
          label: MONTHS[m],
        });
      }
    } else {
      // All-time mode - show months with year labels
      if (timelineData.length === 0) return [];
      
      const dates = timelineData.map(d => d.date);
      const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
      const latest = new Date(Math.max(...dates.map(d => d.getTime())));
      
      const current = new Date(earliest);
      current.setDate(1); // Start of month
      
      while (current <= latest) {
        const year = current.getFullYear();
        const month = current.getMonth();
        markers.push({
          x: getXForDate(new Date(current)),
          label: `${MONTHS[month]} ${year}`,
        });
        // Move to next month
        current.setMonth(month + 1);
      }
    }
    
    return markers;
  }, [selectedYear, timelineData, getXForDate]);

  // Memoize tooltip items
  const tooltipItems = useMemo(() => {
    if (!currentData) return [];

    const LABEL_HEIGHT = 32;
    const items = currentData.rankings.slice(0, 3);

    const positioned = items
      .map((item) => ({
        ...item,
        y: getScoreY(item.score),
      }))
      .sort((a, b) => a.y - b.y);

    let iterations = 0;
    const maxIterations = 10;
    let hasOverlap = true;

    while (hasOverlap && iterations < maxIterations) {
      hasOverlap = false;
      for (let i = 0; i < positioned.length - 1; i++) {
        const current = positioned[i];
        const next = positioned[i + 1];
        const gap = next.y - current.y;

        if (gap < LABEL_HEIGHT) {
          hasOverlap = true;
          const overlap = LABEL_HEIGHT - gap;
          current.y -= overlap / 2;
          next.y += overlap / 2;
        }
      }
      iterations++;
    }

    return positioned;
  }, [currentData, getScoreY]);

  // Memoize sorted legend models
  const sortedLegendModels = useMemo(() => {
    return Array.from(allModels).sort((a, b) => {
      const freqA = timelineData.reduce(
        (sum, data) => sum + (data.rankings.some((r) => r.model === a) ? 1 : 0),
        0
      );
      const freqB = timelineData.reduce(
        (sum, data) => sum + (data.rankings.some((r) => r.model === b) ? 1 : 0),
        0
      );
      return freqB - freqA;
    });
  }, [allModels, timelineData]);

  const handlePrevious = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(timelineData.length - 1, prev + 1));
  }, [timelineData.length]);

  const handlePlayPause = useCallback(() => {
    if (currentIndex >= timelineData.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(false);
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [currentIndex, timelineData.length, isPlaying]);

  const handlePointHoverEnter = useCallback(
    (point: { x: number; y: number; model: string }) => {
      if (!isPlaying && !isScrolling) {
        setHoveredPoint(point);
      }
    },
    [isPlaying, isScrolling]
  );

  const handlePointHoverLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  const handleModelClick = useCallback(
    (model: string) => {
      const isSelected = selectedModels.includes(model);

      setSelectedModels((prev) =>
        isSelected ? prev.filter((m) => m !== model) : [...prev, model]
      );

      if (!isSelected) {
        const firstIndex = timelineData.findIndex((data) =>
          data.rankings.some((r) => r.model === model)
        );
        if (firstIndex !== -1) {
          setCurrentIndex(firstIndex);
          setIsPlaying(false);
        }
      }
    },
    [selectedModels, timelineData]
  );

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="size-12 text-gray-900 dark:text-white" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading evolution data...</p>
      </div>
    );
  }

  if (timelineData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
        <div className="flex items-center justify-between w-full mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Model Evolution</h2>
          <Select 
            value={selectedYear === null ? "all" : selectedYear.toString()} 
            onValueChange={(v) => {
              if (v === "all") {
                onYearChange(null);
              } else {
                onYearChange(parseInt(v));
              }
            }}
          >
            <SelectTrigger className="w-[140px] bg-white/20 dark:bg-white/5 border-white/30 dark:border-white/10">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No model usage data available {selectedYear !== null ? `for ${selectedYear}` : ""}
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">Try selecting a different year or check your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[600px] overflow-hidden bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex flex-col justify-center py-12 px-6">
      {/* Year Selection Dropdown */}
      <div className="absolute top-6 right-6 z-50">
        <Select 
          value={selectedYear === null ? "all" : selectedYear.toString()} 
          onValueChange={(v) => {
            if (v === "all") {
              onYearChange(null);
            } else {
              onYearChange(parseInt(v));
            }
          }}
        >
          <SelectTrigger className="w-[140px] bg-white/20 dark:bg-white/5 border-white/30 dark:border-white/10 text-gray-900 dark:text-white">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Week & Top Model Info */}
      <div className="flex flex-col items-center mb-6 z-30">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
          {getWeekLabel(currentData?.date || new Date(), selectedYear === null)}
        </p>
        {topModel && (
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: modelColorMap[topModel] || "#60a5fa" }}
            />
            <span className="text-gray-900 dark:text-white text-sm font-medium">
              {topModel}
            </span>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: CHART_HEIGHT + 60 }}
      >
        <div
          className="absolute top-0 w-px bg-gray-400/50 dark:bg-white/40 z-20"
          style={{ left: "50%", height: CHART_HEIGHT }}
        />

        <div
          ref={chartRef}
          className="absolute top-0"
          style={{
            width: Math.max(totalWidth, containerWidth),
            height: CHART_HEIGHT + 40,
            transform: `translateX(${translateX}px)`,
          }}
        >
          {monthMarkers.map((marker) => {
            return (
              <div
                key={`grid-${marker.label}`}
                className="absolute top-0 bg-gray-300/50 dark:bg-white/10"
                style={{
                  left: marker.x,
                  height: CHART_HEIGHT,
                  width: 1,
                }}
              />
            );
          })}

          {monthMarkers.map((marker) => {
            return (
              <div
                key={`month-${marker.label}`}
                className="absolute text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap"
                style={{
                  left: marker.x,
                  top: CHART_HEIGHT + 12,
                  transform: "translateX(-50%)",
                }}
              >
                {marker.label}
              </div>
            );
          })}

          {visiblePoints.map((point, idx) => {
            const DOT_SIZE = 5;
            const HIT_AREA = 24;

            const isModelHovered = hoveredModels.includes(point.model);
            const isModelSelected = selectedModels.includes(point.model);
            const hasSelection = selectedModels.length > 0;
            const hasHover = hoveredModels.length > 0;

            const isHighlighted = hasSelection
              ? isModelSelected || isModelHovered
              : isModelHovered || !hasHover;

            const isHoveredPoint =
              !isPlaying &&
              !isScrolling &&
              hoveredPoint?.x === point.x &&
              hoveredPoint?.y === point.y &&
              hoveredPoint?.model === point.model;

            return (
              <div
                key={`${point.model}-${idx}`}
                className={cn(
                  "absolute flex items-center justify-center cursor-pointer group",
                  (isPlaying || isScrolling) && "pointer-events-none"
                )}
                style={{
                  left: point.x - HIT_AREA / 2,
                  top: point.y - HIT_AREA / 2,
                  width: HIT_AREA,
                  height: HIT_AREA,
                  zIndex: isHoveredPoint || isHighlighted ? 10 : 1,
                }}
                onMouseEnter={() => handlePointHoverEnter(point)}
                onMouseLeave={handlePointHoverLeave}
              >
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    backgroundColor: modelColorMap[point.model] || "#60a5fa",
                    opacity: isHighlighted ? 1 : 0.15,
                    transform:
                      isModelHovered || isHoveredPoint
                        ? "scale(1.5)"
                        : "scale(1)",
                  }}
                />
              </div>
            );
          })}

          {!isPlaying && !isScrolling && hoveredPoint && (
            <div
              className="absolute z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/70 dark:bg-white/15 text-gray-900 dark:text-white backdrop-blur-md border border-white/40 dark:border-white/20 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
              style={{
                left: hoveredPoint.x,
                top: hoveredPoint.y - 12,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    modelColorMap[hoveredPoint.model] || "#60a5fa",
                }}
              />
              <span>{hoveredPoint.model}</span>
            </div>
          )}
        </div>

        {tooltipItems.map((item) => (
          <div
            key={item.model}
            className="absolute z-30 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out bg-white/60 dark:bg-white/10 text-gray-900 dark:text-white backdrop-blur-md border border-white/30 dark:border-white/20 pointer-events-auto"
            style={{
              left: "50%",
              top: item.y,
              transform: "translate(12px, -50%)",
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: modelColorMap[item.model] || "#60a5fa",
              }}
            />
            <span>{item.model}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 px-4 md:px-8 pb-6 md:pb-8 mt-auto z-30 w-full pointer-events-none">
        <div className="flex items-center gap-4 shrink-0 pointer-events-auto">
          <GlassButton
            onClick={handlePrevious}
            size="icon"
            className="shrink-0 scale-100"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </GlassButton>
          <GlassButton
            onClick={handlePlayPause}
            size="icon"
            className="shrink-0 scale-100"
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {currentIndex >= timelineData.length - 1 ? (
              <RotateCcw size={18} />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="translate-x-[1px]" />
            )}
          </GlassButton>
          <GlassButton
            onClick={handleNext}
            size="icon"
            className="shrink-0 scale-100"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </GlassButton>
          <div className="h-10 flex items-center px-4 bg-white/20 dark:bg-white/5 rounded-xl backdrop-blur-md border border-white/30 dark:border-white/10 shrink-0 shadow-sm">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
              Play or Scroll →
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:max-w-[70%] pointer-events-auto">
          {sortedLegendModels.map((model) => {
            const isSelected = selectedModels.includes(model);
            return (
              <button
                key={model}
                onClick={() => handleModelClick(model)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 backdrop-blur-md border cursor-pointer",
                  isSelected
                    ? "bg-white/80 dark:bg-white/20 text-gray-900 dark:text-white border-white/40 dark:border-white/30 shadow-lg"
                    : "bg-white/40 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-white/20 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/15"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{ backgroundColor: modelColorMap[model] || "#60a5fa" }}
                />
                <span>{model}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

