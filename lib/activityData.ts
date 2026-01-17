// activityData.ts

/**
 * Generates activity data dynamically from November 30, 2022 to the current date
 * Uses a seeded random function to ensure consistent results across runs
 */
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Formats a date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates activity data for a given date
 * Uses the date as a seed to ensure consistent values for the same date
 */
function generateActivityForDate(date: Date): { totalMessages: number; totalConversations: number } {
  const dateStr = formatDate(date);
  const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  // Calculate days since start date to create a growth trend
  const startDate = new Date('2022-11-30');
  const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Base activity increases over time (more recent dates have higher activity)
  const timeMultiplier = Math.min(1 + (daysSinceStart / 1000), 2.5);
  
  // Generate messages: ranges from 0 to ~280, with some days having higher activity
  const messageBase = random() * 100 * timeMultiplier;
  const messageVariation = random() * 50;
  const messageSpike = random() < 0.1 ? random() * 150 : 0; // 10% chance of high activity day
  const totalMessages = Math.floor(messageBase + messageVariation + messageSpike);
  
  // Generate conversations: ranges from 0 to ~12, correlated with messages
  const conversationBase = Math.min(Math.floor(totalMessages / 15), 8);
  const conversationVariation = Math.floor(random() * 4);
  const totalConversations = Math.max(0, Math.min(conversationBase + conversationVariation, 12));
  
  return {
    totalMessages: Math.max(0, totalMessages),
    totalConversations: totalConversations
  };
}

/**
 * Generates activity data from start date to end date (inclusive)
 */
function generateActivityData(
  startDate: Date,
  endDate: Date
): Record<string, { totalMessages: number; totalConversations: number }> {
  const data: Record<string, { totalMessages: number; totalConversations: number }> = {};
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateStr = formatDate(current);
    data[dateStr] = generateActivityForDate(current);
    
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  
  return data;
}

// Generate activity data from November 30, 2022 to today
const startDate = new Date('2022-11-30');
const endDate = new Date(); // Current date
export const activityData: Record<string, { totalMessages: number; totalConversations: number }> = 
  generateActivityData(startDate, endDate);
