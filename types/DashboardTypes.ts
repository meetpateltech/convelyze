export interface RoleBasedMessageData {
    overall: { [key: string]: number };
    gpts: { [key: string]: number };
    voice: { [key: string]: number };
  }
  
  export interface ShiftWiseMessageData {
    [key: string]: number;
  }
  
  export interface ModelWiseMessageData {
    [key: string]: number;
  }
  
  export interface UsageTimelineData {
    firstUsed: string;
    lastUsed: string;
  }
  
  export interface DefaultModelSlugData {
    [key: string]: number;
  }
  
  export interface AIMessageStatusData {
    [key: string]: number;
  }
  
  export interface ToolUsageData {
    [key: string]: number;
  }
  
  export interface LocationData {
    [key: string]: number;
  }
  
  export interface FinishDetailData {
    [key: string]: number;
  }
  
  export interface DashboardData {
    totalConversations: number;
    totalGPTConversations: number;
    totalMessages: number;
    totalGPTMessages: number;
    mostChattyDay: { count: number; date: string };
    timeSpentOnChatGPT: { days: number; hours: number; seconds: number };
    averageDailyMessageCount: number;
    totalArchivedConversations: number;
    totalVoiceMessages: number;
    totalImagesGenerated: number;
    roleBasedMessageData: RoleBasedMessageData;
    shiftWiseMessageData: ShiftWiseMessageData;
    modelWiseMessageData: ModelWiseMessageData;
    usageTimelineData: UsageTimelineData;
    defaultModelSlugData: DefaultModelSlugData;
    aiMessageStatusData: AIMessageStatusData;
    modelAdjustmentsCount: { [key: string]: number };
    userAttachmentMimeTypeCount: { [key: string]: number };
    toolUsageData: ToolUsageData;
    locationData: LocationData;
    finishDetailData: FinishDetailData;
  }
  