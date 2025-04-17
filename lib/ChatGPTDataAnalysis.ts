/* eslint-disable @typescript-eslint/no-explicit-any */
import { encoding_for_model, TiktokenModel } from "tiktoken";

// Type Definitions
interface Author {
  role: string;
  name: string | null;
  metadata: Record<string, any>;
}

interface Message {
  id: string;
  author: Author;
  create_time: number | null;
  update_time: number | null;
  content: {
    content_type: string;
    parts: any[]; // Adjust this type as needed
  };
  metadata: Record<string, any>;
  status: string;
  end_turn: boolean | null;
  weight: number;
  recipient: string;
  channel: any;
}

interface ConversationNode {
  id: string;
  message: Message | null;
  parent: string | null;
  children: string[];
}

interface ConversationData {
  id: string;
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, ConversationNode>;
  conversation_template_id: string | null;
  gizmo_id: string | null;
  is_archived: boolean;
  default_model_slug: string | null;
  voice: string | null;
}

interface TokenUsage {
  userTokens: number;
  assistantTokens: number;
}

interface MonthlyModelUsage {
  [modelSlug: string]: TokenUsage;
}

interface MonthlyUsage {
  [monthYear: string]: MonthlyModelUsage;
}

// Define the model to Tiktoken models mapping
const modelSlugToTiktokenModel: Record<string, TiktokenModel> = {
  "o3": "o1",
  "o4-mini-high": "o3-mini",
  "o4-mini": "o3-mini",
  "o3-mini-high": "o3-mini",
  "research": "o1",
  "o3-mini": "o3-mini", 
  "o1-pro": "o1-preview",
  "o1": "o1",
  "o1-preview": "o1-preview",
  "o1-mini": "o1-mini",
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
  "gpt-4": "gpt-4",
  "gpt-4-turbo": "gpt-4-turbo",
  "gpt-4-vision-preview": "gpt-4-vision-preview",
  "gpt-3.5-turbo-16k": "gpt-3.5-turbo-16k",
  "gpt-3.5-turbo": "gpt-3.5-turbo",
  "text-davinci-003": "text-davinci-003",
  "text-davinci-002": "text-davinci-002",
  "text-davinci-001": "text-davinci-001",
  "text-davinci-002-render": "text-davinci-002",
  "text-davinci-002-render-sha": "text-davinci-002",
  // Add other model slugs as needed
};

// Token Counter Implementation
class OptimizedTokenCounter {
  private encoders: Record<string, any> = {};

  constructor(private modelSlugToTiktokenModel: Record<string, TiktokenModel>) {}

  private getEncoder(modelSlug: string): any {
    if (!this.encoders[modelSlug]) {
      const tiktokenModel = this.getMatchingTiktokenModel(modelSlug);
      this.encoders[modelSlug] = encoding_for_model(tiktokenModel,{ '<|endoftext|>': 50256 });
    }
    return this.encoders[modelSlug];
  }

  private getMatchingTiktokenModel(modelSlug: string): TiktokenModel {
    if (modelSlug in this.modelSlugToTiktokenModel) {
      return this.modelSlugToTiktokenModel[modelSlug];
    }
    // console.warn(`Unknown model slug: ${modelSlug}. Using gpt-3.5-turbo for token counting.`);
    return "gpt-3.5-turbo";
  }

public countTokens(text: string, modelSlug: string): number {
    const encoder = this.getEncoder(modelSlug);
    return encoder.encode(text,"all").length;
}


  public freeEncoders(): void {
    Object.values(this.encoders).forEach(encoder => encoder.free());
    this.encoders = {};
  }
}

export class ChatGPTDataAnalysis {
  private data: ConversationData[];
  private tokenCounter: OptimizedTokenCounter;

  constructor(jsonData: ConversationData[]) {
    this.data = jsonData;
    this.tokenCounter = new OptimizedTokenCounter(modelSlugToTiktokenModel);
  }

  private isGPTsConversation(conversation: ConversationData): boolean {
    return conversation.conversation_template_id?.startsWith('g-') || conversation.gizmo_id?.startsWith('g-') || false;
  }

  public getTotalConversations(): number {
    return this.data.length;
  }

  public getTotalGPTsConversations(): number {
    return this.data.filter(this.isGPTsConversation).length;
  }

  public getTotalMessages(): number {
    let totalMessages = 0;
    this.data.forEach(conversation => {
      totalMessages += Object.values(conversation.mapping).filter(node => node.message !== null).length;
    });
    return totalMessages;
  }

  public getTotalGPTsMessages(): number {
    let totalMessages = 0;
    this.data.forEach(conversation => {
      if (this.isGPTsConversation(conversation)) {
        totalMessages += Object.values(conversation.mapping).filter(node => node.message !== null).length;
      }
    });
    return totalMessages;
  }

  public getRoleBasedMessageCount(): Record<string, number> {
    const roleCount: Record<string, number> = {};
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null) {
          const role = node.message.author.role;
          roleCount[role] = (roleCount[role] || 0) + 1;
        }
      });
    });
    return roleCount;
  }

  public getRoleBasedGPTsMessageCount(): Record<string, number> {
    const roleCount: Record<string, number> = {};
    this.data.forEach(conversation => {
      if (this.isGPTsConversation(conversation)) {
        Object.values(conversation.mapping).forEach(node => {
          if (node.message !== null) {
            const role = node.message.author.role;
            roleCount[role] = (roleCount[role] || 0) + 1;
          }
        });
      }
    });
    return roleCount;
  }

  public getMostChattyDay(): { date: string, count: number } {
    const dayCount: Record<string, number> = {};
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.create_time !== null) {
          const date = new Date(node.message.create_time * 1000).toISOString().split('T')[0];
          dayCount[date] = (dayCount[date] || 0) + 1;
        }
      });
    });

    let mostChattyDay = '';
    let maxCount = 0;
    for (const [date, count] of Object.entries(dayCount)) {
      if (count > maxCount) {
        maxCount = count;
        mostChattyDay = date;
      }
    }
    return { date: mostChattyDay, count: maxCount };
  }

  public getShiftWiseMessageCount(): { shifts: Record<string, number>, totalShiftMessages: number } {
    const shifts = {
        morning: 0,   // 6 AM to 12 PM
        afternoon: 0, // 12 PM to 5 PM
        evening: 0,   // 5 PM to 9 pm
        night: 0,     // 12 AM to 6 AM
        unspecified: 0 // For messages without timestamps
    };

    let totalShiftMessages = 0;

    this.data.forEach(conversation => {
        Object.values(conversation.mapping).forEach(node => {
          if (node.message !== null) {
            if (node.message.create_time !== null) {
                const hour = new Date(node.message.create_time * 1000).getUTCHours();
                const minute = new Date(node.message.create_time * 1000).getUTCMinutes();
                
                if (hour >= 6 && hour < 12) {
                    shifts.morning++;
                } else if (hour >= 12 && hour < 17) {
                    shifts.afternoon++;
                } else if ((hour === 17 && minute >= 0) || (hour >= 18 && hour < 21)) {
                    shifts.evening++;
                } else {
                    shifts.night++;
                }
                    totalShiftMessages++;
                } else {
                    shifts.unspecified++;
                }
            }
        });
    });

    return { shifts, totalShiftMessages };
  }

  public getTimeSpentOnChatGPT(): { hours: number, days: number, seconds: number } {
    let totalTimeSpent = 0;

    for (const conversation of this.data) {
      let userMessageTime: number | null = null;
      let assistantMessageTime: number | null = null;

      for (const node of Object.values(conversation.mapping)) {
        const message = node.message;
        if (message && message.content && message.content.parts && message.content.parts.length > 0) {
          if (message.author.role === 'user') {
            userMessageTime = message.create_time;
          } else if (message.author.role === 'assistant') {
            if (userMessageTime !== null && message.create_time !== null) {
              totalTimeSpent += message.create_time - userMessageTime;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            assistantMessageTime = message.create_time;
            userMessageTime = null;
          }
        }
      }
    }

    const hours = parseFloat((totalTimeSpent / 3600).toFixed(2));
    const days = parseFloat((totalTimeSpent / 86400).toFixed(2));
    const seconds = parseFloat(totalTimeSpent.toFixed(2));
    return { hours, days, seconds };
  }

  public getAverageDailyMessageCount(): number {
    const dayMessageCount = this.getMostChattyDay();
    return this.getTotalMessages() / dayMessageCount.count;
  }

  public getModelWiseMessageCount(): Record<string, number> {
    const modelCount: Record<string, number> = {};
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && (node.message.author.role === 'assistant' || node.message.author.role === 'tool') && node.message.content.parts && node.message.content.parts.length > 0) {
          const modelSlug = node.message.metadata.model_slug || 'unknown';
          modelCount[modelSlug] = (modelCount[modelSlug] || 0) + 1;
        }
      });
    });
    return modelCount;
  }

  public getFirstAndLastUsedDate(): { firstUsed: Date, lastUsed: Date } {
    const allTimestamps: number[] = [];
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.create_time !== null) {
          allTimestamps.push(node.message.create_time);
        }
      });
    });

    const firstUsed = new Date(Math.min(...allTimestamps) * 1000);
    const lastUsed = new Date(Math.max(...allTimestamps) * 1000);

    return { firstUsed, lastUsed };
  }

  public getDateWiseActivity(): Record<string, { totalMessages: number, totalConversations: number }> {
    const dateWiseActivity: Record<string, { totalMessages: number, totalConversations: number }> = {};
  
    this.data.forEach(conversation => {
      const conversationDate = new Date(conversation.create_time * 1000).toISOString().split('T')[0];
      if (!dateWiseActivity[conversationDate]) {
        dateWiseActivity[conversationDate] = { totalMessages: 0, totalConversations: 0 };
      }
      dateWiseActivity[conversationDate].totalConversations++;
  
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.create_time !== null) {
          const messageDate = new Date(node.message.create_time * 1000).toISOString().split('T')[0];
          if (!dateWiseActivity[messageDate]) {
            dateWiseActivity[messageDate] = { totalMessages: 0, totalConversations: 0 };
          }
          dateWiseActivity[messageDate].totalMessages++;
        }
      });
    });
  
    return dateWiseActivity;
  }

  public getTotalArchivedConversations(): number {
    return this.data.filter(conversation => conversation.is_archived).length;
  }

  public getDefaultModelSlugCount(): Record<string, number> {
    const modelSlugCount: Record<string, number> = {};
  
    this.data.forEach(conversation => {
      const modelSlug = conversation.default_model_slug || 'unknown';
      modelSlugCount[modelSlug] = (modelSlugCount[modelSlug] || 0) + 1;
    });
  
    return modelSlugCount;
  }

  public getModelAdjustmentsCount(): Record<string, number> {
    const adjustmentsCount: Record<string, number> = {};
  
    this.data.forEach((conversation: ConversationData) => {
      Object.values(conversation.mapping).forEach((node: ConversationNode) => {
        if (node.message !== null && node.message.author.role === 'assistant') {
          const modelAdjustments = node.message.metadata.model_adjustments || [];
          modelAdjustments.forEach((adjustment: string) => {
            adjustmentsCount[adjustment] = (adjustmentsCount[adjustment] || 0) + 1;
          });
        }
      });
    });
  
    return adjustmentsCount;
  }

  public getStatusCount(): Record<string, Record<string, number>> {
    const statusCount: Record<string, Record<string, number>> = {
      user: {},
      assistant: {}
    };
  
    this.data.forEach((conversation: ConversationData) => {
      Object.values(conversation.mapping).forEach((node: ConversationNode) => {
        if (node.message !== null) {
          const role = node.message.author.role;
          const status = node.message.status;
  
          if (role === 'user' || role === 'assistant') {
            if (!statusCount[role][status]) {
              statusCount[role][status] = 0;
            }
            statusCount[role][status]++;
          }
        }
      });
    });
  
    return statusCount;
  }

  public getFinishDetailsTypeCount(): Record<string, number> {
    const finishDetailsTypeCount: Record<string, number> = {};
  
    this.data.forEach((conversation: ConversationData) => {
      Object.values(conversation.mapping).forEach((node: ConversationNode) => {
        if (node.message !== null && node.message.metadata && node.message.metadata.finish_details) {
          const finishType = node.message.metadata.finish_details.type;
          if (finishType) {
            finishDetailsTypeCount[finishType] = (finishDetailsTypeCount[finishType] || 0) + 1;
          }
        }
      });
    });
  
    return finishDetailsTypeCount;
  }

  public getTotalVoiceMessages(): number {
    let totalVoiceMessages = 0;
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.metadata.voice_mode_message) {
          totalVoiceMessages++;
        }
      });
    });
    return totalVoiceMessages;
  }

  public getRoleBasedVoiceMessageCount(): Record<string, number> {
    const roleVoiceCount: Record<string, number> = {
      user: 0,
      assistant: 0
    };
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.metadata.voice_mode_message) {
          const role = node.message.author.role;
          if (role === 'user' || role === 'assistant') {
            roleVoiceCount[role]++;
          }
        }
      });
    });
    return roleVoiceCount;
  }

  public getDALLEImageCount(): number {
    const dalleGizmoId = 'g-2fkFE8rbu';
    let dalleImageCount = 0;

    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.author.role === 'assistant' && node.message.metadata.gizmo_id === dalleGizmoId) {
          if(node.message.content && node.message.content.parts && Array.isArray(node.message.content.parts)) { // Added null check for content and checks for parts to be an array
            const parts = node.message.content.parts;
            if (parts.some(part => typeof part === 'string' && part.toLowerCase().includes('prompt'))) { // Added safety check for part being a string
              dalleImageCount++;
            }
          }
        }
      });
    });

    return dalleImageCount;
  }

  public getDALLEImageCountWithoutGizmo(): number {
    let dalleImageCount = 0;

    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && 
            node.message.author.role === 'tool' && 
            node.message.author.name === 'dalle.text2im') {
          if (node.message.content && node.message.content.parts && Array.isArray(node.message.content.parts)) { // Added safety check for parts to be an array
            const parts = node.message.content.parts;
            const dallePart = parts.find(part => 
              part && 
              typeof part === 'object' &&
              part.metadata && 
              part.metadata.dalle && 
              part.metadata.dalle.gen_id && 
              part.metadata.dalle.prompt
            );
            if (dallePart) {
              dalleImageCount++;
            }
          }
        }
      });
    });

    return dalleImageCount;
  }
  
  public getUserAttachmentMimeTypeCount(): Record<string, number> {
    const mimeTypeCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && 
            node.message.author.role === 'user' && 
            node.message.metadata && 
            Array.isArray(node.message.metadata.attachments)) {
          node.message.metadata.attachments.forEach(attachment => {
            if (attachment.mime_type) {
              mimeTypeCount[attachment.mime_type] = (mimeTypeCount[attachment.mime_type] || 0) + 1;
            }
          });
        }
      });
    });

    return mimeTypeCount;
  }

  public getToolNameCount(): Record<string, number> {
    const toolNameCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && 
            node.message.author.role === 'tool' && 
            node.message.author.name) {
          const toolName = node.message.author.name;
          toolNameCount[toolName] = (toolNameCount[toolName] || 0) + 1;
        }
      });
    });

    return toolNameCount;
  }

  public getRecipientCount(): Record<string, number> {
    const recipientCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null) {
          const recipient = node.message.recipient;
          recipientCount[recipient] = (recipientCount[recipient] || 0) + 1;
        }
      });
    });

    return recipientCount;
  }

  public getChannelCount(): Record<string, number> {
    const channelCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null) {
          const channel = node.message.channel;
          channelCount[channel] = (channelCount[channel] || 0) + 1;
        }
      });
    });

    return channelCount;
  }

  public getLocationCodes(): Record<string, Record<string, number>> {
    const locationCodeCount: Record<string, Record<string, number>> = {
      user: {},
      assistant: {}
    };
  
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.metadata && node.message.metadata.request_id) {
          const requestId = node.message.metadata.request_id;
          const locationCode = requestId.split('-').pop(); // Extract the text after the last hyphen
          if (locationCode && locationCode.length === 3) { // Check if it's exactly three characters long
            const role = node.message.author.role;
            if (role === 'user' || role === 'assistant') {
              if (!locationCodeCount[role][locationCode]) {
                locationCodeCount[role][locationCode] = 0;
              }
              locationCodeCount[role][locationCode]++;
            }
          }
        }
      });
    });
  
    return locationCodeCount;
  }

  public getRequestedModelCount(): Record<string, number> {
    const modelMessageCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.author.role === 'assistant' && node.message.metadata.requested_model_slug) {
          const modelSlug = node.message.metadata.requested_model_slug;
          modelMessageCount[modelSlug] = (modelMessageCount[modelSlug] || 0) + 1;
        }
      });
    });

    return modelMessageCount;
  }

  public getAssistantGeneratedCodeBlockCount(): Record<string, number> {
    const codeBlockCount: Record<string, number> = {};
  
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.author.role === 'assistant' && node.message.content.parts) {
          node.message.content.parts.forEach(part => {
            const codeBlockRegex = /```(\w+)/g;
            let match;
            while ((match = codeBlockRegex.exec(part)) !== null) {
              const langName = match[1];
              codeBlockCount[langName] = (codeBlockCount[langName] || 0) + 1;
            }
          });
        }
      });
    });
  
    return codeBlockCount;
  }

  // Helper method to check if a date is valid
  private isValidDate(date: Date): boolean {
    return date.getFullYear() >= 2022 && date.getFullYear() <= new Date().getFullYear();
}

// Method to get model slug for user message
private getModelSlugForUserMessage(conversation: ConversationData, userMessageId: string): string {
    const userNode = conversation.mapping[userMessageId];
    if (!userNode || !userNode.children || userNode.children.length === 0) {
        return "unknown";
    }
    const assistantNode = conversation.mapping[userNode.children[0]];
    if (!assistantNode || !assistantNode.message || !assistantNode.message.metadata) {
        return "unknown";
    }
    return assistantNode.message.metadata.model_slug || "unknown";
}

public getMonthlyModelWiseTokenUsage(): MonthlyUsage {
  const monthlyUsage: MonthlyUsage = {};

  // Move monthNames outside the loop
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  this.data.forEach(conversation => {
    Object.values(conversation.mapping).forEach(node => {
      if (node.message !== null && node.message.content && Array.isArray(node.message.content.parts)) {
        const messageText = node.message.content.parts.join(' ');
        const messageDate = new Date(node.message.create_time! * 1000);

        // Check if the date is valid
        if (!this.isValidDate(messageDate)) {
          // console.warn(`Invalid date detected: ${messageDate.toISOString()}. Skipping this entry.`);
          return;
        }

        // Format the monthYear as "MMM-YY" using the pre-defined monthNames
        const monthYear = `${monthNames[messageDate.getMonth()]}-${String(messageDate.getFullYear()).slice(-2)}`;
        const modelSlug = node.message.metadata.model_slug || this.getModelSlugForUserMessage(conversation, node.id);

        if (!monthlyUsage[monthYear]) {
          monthlyUsage[monthYear] = {};
        }

        if (!monthlyUsage[monthYear][modelSlug]) {
          monthlyUsage[monthYear][modelSlug] = { userTokens: 0, assistantTokens: 0 };
        }

        // Pass the correct modelSlug instead of a fixed string
        const tokenCount = this.tokenCounter.countTokens(messageText, modelSlug);

        if (node.message.author.role === 'user') {
          monthlyUsage[monthYear][modelSlug].userTokens += tokenCount;
        } else if (node.message.author.role === 'assistant') {
          monthlyUsage[monthYear][modelSlug].assistantTokens += tokenCount;
        }
      }
    });
  });

  // Remove entries where both userTokens and assistantTokens are 0
  Object.keys(monthlyUsage).forEach(monthYear => {
    Object.keys(monthlyUsage[monthYear]).forEach(modelSlug => {
      const usage = monthlyUsage[monthYear][modelSlug];
      if (usage.userTokens === 0 && usage.assistantTokens === 0) {
        delete monthlyUsage[monthYear][modelSlug];
      }
    });
    // Remove month if it's empty
    if (Object.keys(monthlyUsage[monthYear]).length === 0) {
      delete monthlyUsage[monthYear];
    }
  });

  return monthlyUsage;
}

public cleanup(): void {
    this.tokenCounter.freeEncoders();
}

  public getCustomInstructionMessageCount(): number {
    const customInstructionCount = this.data.reduce((count, conversation) => 
        count + Object.values(conversation.mapping)
            .filter(node => 
                node.message?.author?.role === 'user' && 
                node.message?.metadata?.is_user_system_message === true
            ).length
    , 0);
    
    return customInstructionCount;
  }

  public getUserTargetedReplyCount(): number {
    const targetedReplyCount = this.data.reduce((count, conversation) => 
        count + Object.values(conversation.mapping)
            .filter(node => 
                node.message?.author?.role === 'user' && 
                node.message?.metadata?.targeted_reply
            ).length
    , 0);

    return targetedReplyCount;
  }

  public getUserSystemHintsCount(): Record<string, number> {
    const systemHintsCount: Record<string, number> = {};
  
    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null && node.message.author.role === 'user' && node.message.metadata.system_hints) {
          node.message.metadata.system_hints.forEach((hint: string) => { // Explicit type annotation
            systemHintsCount[hint] = (systemHintsCount[hint] || 0) + 1;
          });
        }
      });
    });
  
    return systemHintsCount;
  }

  /* public getWebpageCount(): number {
    let webpageCount = 0;

    for (const conversation of this.data) {
        for (const node of Object.values(conversation.mapping)) {
            const metadataList = node.message?.metadata?._cite_metadata?.metadata_list;
            if (node.message?.author?.role === 'tool' && Array.isArray(metadataList)) {
                webpageCount += metadataList.filter(item => item?.type === 'webpage').length;
            }
        }
    }
    return webpageCount;
  } */

    public getWebpageCount(): number {
      let webpageCount = 0;
  
      for (const conversation of this.data) {
          for (const node of Object.values(conversation.mapping)) {
              const message = node.message;
              // Check for the older format
              const metadataList = message?.metadata?._cite_metadata?.metadata_list;
              if (message?.author?.role === 'tool' && Array.isArray(metadataList)) {
                  webpageCount += metadataList.filter(item => item?.type === 'webpage').length;
              }
              // Check for the newer format in content_references
              const contentReferences = message?.metadata?.content_references;
              if (Array.isArray(contentReferences)) {
                webpageCount += contentReferences.filter(ref => 
                  ref?.type === 'webpage' || 
                  ref?.type === 'grouped_webpages' ||
                  ref?.type === 'webpage_extended'
                ).length;
            }
          }
      }
      return webpageCount;
  }

  public getLongestConversation(): { 
    id: string, 
    title: string, 
    messageCount: number, 
    roleDistribution: Record<string, number>, 
    firstUsed: Date, 
    lastUsed: Date 
  } | null {
    let longestConversation: { 
      id: string, 
      title: string, 
      messageCount: number, 
      roleDistribution: Record<string, number>, 
      firstUsed: Date, 
      lastUsed: Date 
    } | null = null;

    for (const conversation of this.data) {
      const messageCount = Object.values(conversation.mapping)
        .filter(node => node.message !== null).length;
      
      if (messageCount === 0) continue;

      const roleDistribution: Record<string, number> = {};
      const allTimestamps: number[] = [];

      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null) {
          const role = node.message.author.role;
          roleDistribution[role] = (roleDistribution[role] || 0) + 1;

          if (node.message.create_time !== null) {
            allTimestamps.push(node.message.create_time);
          }
          if (node.message.update_time !== null) {
            allTimestamps.push(node.message.update_time);
          }
        }
      });

      if (allTimestamps.length > 0) {
        const firstUsed = new Date(Math.min(...allTimestamps) * 1000);
        const lastUsed = new Date(Math.max(...allTimestamps) * 1000);

        if (longestConversation === null || messageCount > longestConversation.messageCount) {
          longestConversation = {
            id: conversation.id,
            title: conversation.title,
            messageCount,
            roleDistribution,
            firstUsed,
            lastUsed
          };
        }
      }
    }

    return longestConversation;
  }

  public getDocumentCanvasStats(): {
    emoji: { total: number, words: number, sections: number, lists: number, remove: number },
    suggestEdits: { totalSuggestEdits: number, totalCommentsAdded: number },
    polish: number,
    readingLevel: { total: number, graduate: number, college: number, highSchool: number, middleSchool: number, kindergarten: number },
    length: { total: number, longest: number, longer: number, shorter: number, shortest: number }
    } {
    // Emoji Stats
    let totalEmojiEdits = 0;
    let wordsEmojiEdits = 0;
    let sectionsEmojiEdits = 0;
    let listsEmojiEdits = 0;
    let removeEmojiEdits = 0;

    // Suggest Edit Stats
    let totalSuggestEdits = 0;
    let totalCommentsAdded = 0;

    // Final Polish
    let finalPolishCount = 0;


    // Reading Level
    let totalReadingLevelEdits = 0;
    let graduateLevelEdits = 0;
    let collegeLevelEdits = 0;
    let highSchoolLevelEdits = 0;
    let middleSchoolLevelEdits = 0;
    let kindergartenLevelEdits = 0;


    // Length
    let totalLengthEdits = 0;
    let longestEdits = 0;
    let longerEdits = 0;
    let shorterEdits = 0;
    let shortestEdits = 0;


    this.data.forEach(conversation => {
        Object.values(conversation.mapping).forEach(node => {
           if (node.message && node.message.metadata?.canvas?.textdoc_type === 'document') {
            // Emoji
            if (node.message.author.role === 'user' && node.message.metadata?.canvas?.accelerator_metadata?.id === 'emoji') {
                const canvasMeta = node.message.metadata.canvas;
                if (canvasMeta && canvasMeta.accelerator_metadata) {
                    const prompt = canvasMeta.accelerator_metadata.prompt;

                        totalEmojiEdits++;

                    if (prompt === "Replace as many words as possible with emojis.") {
                        wordsEmojiEdits++;
                    } else if (prompt === "Add three emojis at the start or end of every major section or paragraph to give subtle decoration. Do not change the structure of the original text. Do not add emojis to lists.") {
                        sectionsEmojiEdits++;
                    } else if (prompt === "Add emojis to lists for visual flair. Do not change the structure of the original text.") {
                        listsEmojiEdits++;
                    } else if (prompt === "Remove emojis") {
                        removeEmojiEdits++;
                    }
                }
            }

           // Suggest Edits and comments
           if (node.message) {
            // Count Suggest Edits (only for textdoc_type: "document")
            if (node.message.author.role === 'user' &&
                node.message.metadata?.canvas?.accelerator_metadata?.id === 'suggest') {
                totalSuggestEdits++;
            }

            // Count Comments (only for textdoc_type: "document")
            if (node.message.author.role === 'tool' &&
                node.message.author.name === 'canmore.comment_textdoc' &&
                node.message.metadata?.canvas?.comment_ids) {
                totalCommentsAdded += node.message.metadata.canvas.comment_ids.length;
            }
          }

          // Final Polish
          if(node.message &&
            node.message.author.role === 'user' &&
            node.message.metadata?.canvas?.accelerator_metadata?.id === 'polish'){
            finalPolishCount++;
            }


           //Reading level
            if (node.message.author.role === 'user' && node.message.metadata?.canvas?.accelerator_metadata?.id === 'reading-level') {
                const canvasMeta = node.message.metadata.canvas;
                if (canvasMeta && canvasMeta.accelerator_metadata) {
                    const prompt = canvasMeta.accelerator_metadata.prompt;

                        totalReadingLevelEdits++;

                    if (prompt === "Rewrite this text at the reading level of a doctoral writer in this subject. You may reply that you adjusted the text to reflect a graduate school reading level, but do not mention the prompt.") {
                        graduateLevelEdits++;
                    } else if (prompt === "Rewrite this text at the reading level of a college student majoring in this subject") {
                        collegeLevelEdits++;
                    } else if (prompt === "Rewrite this text at the reading level of a high school student who has taken a couple of classes in this subject.") {
                        highSchoolLevelEdits++;
                    } else if (prompt === "Rewrite this text at the reading level of a middle schooler.") {
                        middleSchoolLevelEdits++;
                    } else if (prompt === "Rewrite this text at the reading level of a kindergartener.") {
                        kindergartenLevelEdits++;
                    }
                }
            }

           // Length Adjustments
            if (node.message.author.role === 'user' && node.message.metadata?.canvas?.accelerator_metadata?.id === 'length') {
                const canvasMeta = node.message.metadata.canvas;
                if (canvasMeta && canvasMeta.accelerator_metadata) {
                    const prompt = canvasMeta.accelerator_metadata.prompt;

                        totalLengthEdits++;

                    if (prompt === "Make this text 75% longer.") {
                        longestEdits++;
                    } else if (prompt === "Make this text 50% longer.") {
                        longerEdits++;
                    } else if (prompt === "Make this text 50% shorter.") {
                        shorterEdits++;
                    } else if (prompt === "Make this text 75% shorter.") {
                       shortestEdits++;
                    }
                }
              }
           }
        });
    });

    return {
       emoji: {
           total: totalEmojiEdits,
           words: wordsEmojiEdits,
           sections: sectionsEmojiEdits,
           lists: listsEmojiEdits,
           remove: removeEmojiEdits
       },
       suggestEdits: {
        totalSuggestEdits,
        totalCommentsAdded
      },
      polish: finalPolishCount,
      readingLevel: {
          total: totalReadingLevelEdits,
          graduate: graduateLevelEdits,
          college: collegeLevelEdits,
          highSchool: highSchoolLevelEdits,
          middleSchool: middleSchoolLevelEdits,
          kindergarten: kindergartenLevelEdits
      },
       length: {
         total: totalLengthEdits,
         longest: longestEdits,
         longer: longerEdits,
         shorter: shorterEdits,
         shortest: shortestEdits
    }
  };
}

public getCodeCanvasStats(): {
    comments: { total: number; [lang: string]: number };
    logs: { total: number; [lang: string]: number };
    fixBugs: { total: number; [lang: string]: number };
    review: {
        total: { reviews: number; comments: number };
        [lang: string]: { reviews: number; comments: number };
    };
    port: { total: number, php: number, cpp: number, python: number, javascript: number, typescript: number, java: number };
  } {
    // Code Comment Stats
    const codeCommentCounts: { total: number; [lang: string]: number } = { total: 0 };

    // Code Log Stats
    const codeLogCounts: { total: number; [lang: string]: number } = { total: 0 };

    // Code Fix Bug Stats
    const codeFixBugCounts: { total: number; [lang: string]: number } = { total: 0 };
    
      // Code Review Stats
    const codeReviewAndCommentCounts: {
      total: { reviews: number; comments: number };
      [lang: string]: { reviews: number; comments: number };
  } = { total: { reviews: 0, comments: 0 } };


  // Code Port Stats
    let totalCodePortEdits = 0;
    let phpEdits = 0;
    let cppEdits = 0;
    let pythonEdits = 0;
    let javascriptEdits = 0;
    let typescriptEdits = 0;
    let javaEdits = 0;

    this.data.forEach(conversation => {
        Object.values(conversation.mapping).forEach(node => {
            if (node.message && node.message.metadata?.canvas?.textdoc_type?.startsWith('code/')) {
              // Code Comment
               if (node.message.author.role === 'user' &&
                node.message.metadata?.canvas?.accelerator_metadata?.id === 'comments') {
                    codeCommentCounts.total++;
                    const lang = node.message.metadata.canvas.textdoc_type.split('/').pop() as string;
                    codeCommentCounts[lang] = (codeCommentCounts[lang] || 0) + 1;
                }

              // Code Log
              if (node.message.author.role === 'user' &&
                  node.message.metadata?.canvas?.accelerator_metadata?.id === 'logs') {
                      codeLogCounts.total++;
                      const lang = node.message.metadata.canvas.textdoc_type.split('/').pop() as string;
                      codeLogCounts[lang] = (codeLogCounts[lang] || 0) + 1;
                  }

               // Code Fix Bug
                if (node.message.author.role === 'user' &&
                    node.message.metadata?.canvas?.accelerator_metadata?.id === 'bugs') {
                      codeFixBugCounts.total++;
                      const lang = node.message.metadata.canvas.textdoc_type.split('/').pop() as string;
                      codeFixBugCounts[lang] = (codeFixBugCounts[lang] || 0) + 1;
                    }
                
               // Code Review & Comments
                if (node.message) {
                    // Count Code Reviews
                    if (node.message.author.role === 'user' &&
                      node.message.metadata?.canvas?.accelerator_metadata?.id === 'review') {
                        codeReviewAndCommentCounts.total.reviews++;
                        const lang = node.message.metadata.canvas.textdoc_type.split('/').pop() as string;
                        codeReviewAndCommentCounts[lang] = codeReviewAndCommentCounts[lang] || { reviews: 0, comments: 0 };
                        codeReviewAndCommentCounts[lang].reviews++;
                    }
        
                    // Count Code Comments
                    if (node.message.author.role === 'tool' &&
                        node.message.author.name === 'canmore.comment_textdoc' &&
                        node.message.metadata?.canvas?.comment_ids) {
                          codeReviewAndCommentCounts.total.comments += node.message.metadata.canvas.comment_ids.length;
                          const lang = node.message.metadata.canvas.textdoc_type.split('/').pop() as string;
                          codeReviewAndCommentCounts[lang] = codeReviewAndCommentCounts[lang] || { reviews: 0, comments: 0 };
                          codeReviewAndCommentCounts[lang].comments += node.message.metadata.canvas.comment_ids.length;
                    }
                 }
              
              // Code Port
              if (node.message.author.role === 'user' && node.message.metadata?.canvas?.accelerator_metadata?.id === 'port') {
                  const canvasMeta = node.message.metadata.canvas;
                  if (canvasMeta && canvasMeta.accelerator_metadata) {
                      const prompt = canvasMeta.accelerator_metadata.prompt;
  
                          totalCodePortEdits++;
  
                          if (prompt === "Create a new document that rewrites the code in PHP") {
                              phpEdits++;
                          } else if (prompt === "Create a new document that rewrites the code in C++") {
                              cppEdits++;
                          } else if (prompt === "Create a new document that rewrites the code in Python") {
                              pythonEdits++;
                          } else if (prompt === "Create a new document that rewrites the code in JavaScript") {
                              javascriptEdits++;
                          } else if (prompt === "Create a new document that rewrites the code in TypeScript") {
                              typescriptEdits++;
                          } else if (prompt === "Create a new document that rewrites the code in Java") {
                              javaEdits++;
                          }
                      }
                  }
             }
        });
    });

    return {
      comments: codeCommentCounts,
      logs: codeLogCounts,
      fixBugs: codeFixBugCounts,
      review: codeReviewAndCommentCounts,
      port: {
          total: totalCodePortEdits,
          php: phpEdits,
          cpp: cppEdits,
          python: pythonEdits,
          javascript: javascriptEdits,
          typescript: typescriptEdits,
          java: javaEdits
      }
    };
  }

  // Canvas CodeBlock Count

  public getCanvasCodeBlockCount(): { total: number; [lang: string]: number } {
    const canvasCodeBlockCount: { total: number; [lang: string]: number } = { total: 0 };
    for (const conversation of this.data) {
        for (const node of Object.values(conversation.mapping)) {
            if (
                node.message?.author?.role === 'tool' &&
                node.message.metadata?.canvas?.textdoc_type?.startsWith('code/')
            ) {
                canvasCodeBlockCount.total++;
                const lang = node.message.metadata.canvas.textdoc_type.split('/').pop() as string;
                canvasCodeBlockCount[lang] = (canvasCodeBlockCount[lang] || 0) + 1;
            }
        }
    }
    return canvasCodeBlockCount;
  }

  public getDefaultAndSpecificModelMessageCount(): { defaultModelCount: number, specificModelCount: number } {
    let defaultModelCount = 0;
    let specificModelCount = 0;

    this.data.forEach(conversation => {
      Object.values(conversation.mapping).forEach(node => {
        if (node.message !== null) {
          if (node.message.metadata.default_model_slug === 'auto') {
            defaultModelCount++;
          } else {
            specificModelCount++;
          }
        }
      });
    });

    return { defaultModelCount, specificModelCount };
  }
}
