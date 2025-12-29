import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Model Name Formatter Utility
export function formatModelName(modelSlug: string): string {
  const modelNameMap: Record<string, string> = {
    // GPT-5.2 series
    "gpt-5-2": "GPT-5.2",
    "gpt-5-2-instant": "GPT-5.2 Instant",
    "gpt-5-2-chat": "GPT-5.2 Chat",
    "gpt-5-2-thinking": "GPT-5.2 Thinking",
    "gpt-5-2-pro": "GPT-5.2 Pro",

    // GPT-5.1 series
    "gpt-5-1": "GPT-5.1",
    "gpt-5-1-instant": "GPT-5.1 Instant",
    "gpt-5-1-chat": "GPT-5.1 Chat",
    "gpt-5-1-thinking": "GPT-5.1 Thinking",
    "gpt-5-1-pro": "GPT-5.1 Pro",

    // GPT-5 series
    "gpt-5": "GPT-5",
    "gpt-5-mini": "GPT-5 Mini",
    "gpt-5-instant": "GPT-5 Instant",
    "gpt-5-chat": "GPT-5 Chat",
    "gpt-5-thinking": "GPT-5 Thinking",
    "gpt-5-pro": "GPT-5 Pro",
    "gpt-5-t-mini": "GPT-5 Thinking Mini",
    "gpt-5-a-t-mini": "GPT-5 Thinking Mini",

    // GPT-4 series
    "gpt-4o": "GPT-4o",
    "gpt-4o-mini": "GPT-4o mini",
    "gpt-4o-canmore": "GPT-4o (Canvas)",
    "gpt-4": "GPT-4",
    "gpt-4-1-mini": "GPT-4.1 mini",
    "gpt-4-1": "GPT-4.1",
    "gpt-4-5": "GPT-4.5",

    // O-series models
    o1: "o1",
    "o1-mini": "o1 mini",
    "o1-preview": "o1 Preview",
    "o1-pro": "o1 Pro",
    o3: "o3",
    "o3-pro": "o3 Pro",
    "o3-mini": "o3 mini",
    "o3-mini-high": "o3 Mini High",
    "o4-mini": "o4 Mini",

    // Research models
    research: "Research",

    // Legacy models
    "text-davinci-002-render-sha": "GPT-3.5",
    "text-davinci-002-render": "GPT-3.5",

    // Unknown
    unknown: "Unknown Model",
  };

  // Return mapped name or format the slug nicely if not found
  if (modelNameMap[modelSlug]) {
    return modelNameMap[modelSlug];
  }

  // Fallback: Try to format the slug nicely
  return modelSlug
    .split("-")
    .map((word) => {
      // Capitalize first letter, keep rest as-is for model numbers
      if (word.match(/^[a-z]+$/)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word.toUpperCase();
    })
    .join(" ");
}

// Model Color Mapping Utility
export function getModelColor(modelSlug: string): string {
  const modelColorMap: Record<string, string> = {
    // GPT-5.2 series
    "gpt-5-2": "#5B88B8",
    "gpt-5-2-instant": "#7BA857",
    "gpt-5-2-chat": "#C88558",
    "gpt-5-2-thinking": "#A66B78",
    "gpt-5-2-pro": "#5B9B8B",

    // GPT-5.1 series
    "gpt-5-1": "#C9A658",
    "gpt-5-1-instant": "#6B9847",
    "gpt-5-1-chat": "#B85C5C",
    "gpt-5-1-thinking": "#6B8BA5",
    "gpt-5-1-pro": "#9B7858",

    // GPT-5 series
    "gpt-5": "#D9A578",
    "gpt-5-instant": "#5B9B5B",
    "gpt-5-chat": "#BD7B8B",
    "gpt-5-thinking": "#5BA8B8",
    "gpt-5-pro": "#B89548",
    "gpt-5-t-mini": "#A95848",
    "gpt-5-a-t-mini": "#6BAB6C",
    "gpt-5-mini": "#7B8B9B",

    // GPT-4 series
    "gpt-4o": "#C97868",
    "gpt-4o-mini": "#3B7B6B",
    "gpt-4o-canmore": "#B88595",
    "gpt-4": "#A88538",
    "gpt-4-1-mini": "#4B8B7B",
    "gpt-4-1": "#C8909D",
    "gpt-4-5": "#7B5838",
    "gpt-4-turbo": "#6BB8B8",
    "gpt-4-vision-preview": "#A55454",

    // O-series models
    o1: "#D48878",
    "o1-mini": "#5B7B95",
    "o1-preview": "#A8A658",
    "o1-pro": "#B86958",
    o3: "#4B9898",
    "o3-pro": "#B89878",
    "o3-mini": "#6B7B3C",
    "o3-mini-high": "#C86B6B",
    "o4-mini": "#4B88A8",

    // Research models
    research: "#989548",

    // Legacy models
    "text-davinci-002-render-sha": "#D99568",
    "text-davinci-002-render": "#8B9B5C",
    "gpt-3.5-turbo": "#A66538",

    // Unknown
    unknown: "#888585",
  };

  // Return mapped color or default rose for unknown models
  return modelColorMap[modelSlug] || "#BD4C7D";
}
