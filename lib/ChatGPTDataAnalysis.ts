/* eslint-disable @typescript-eslint/no-explicit-any */

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

// Token Counter Implementation
class HeuristicTokenCounter {
  public countTokens(text: string): number {
    if (!text) return 0;
    const approx = Math.ceil(text.length / 4);
    return approx < 0 ? 0 : approx;
  }

  public free(): void {
    // no-op; exists for API parity with prior implementation
  }
}

export class ChatGPTDataAnalysis {
  private data: ConversationData[];
  private tokenCounter: HeuristicTokenCounter;

  constructor(jsonData: ConversationData[]) {
    this.data = jsonData;
    this.tokenCounter = new HeuristicTokenCounter();
  }

  private isGPTsConversation(conversation: ConversationData): boolean {
    if (!conversation) return false;
    const templateId = conversation.conversation_template_id;
    const gizmoId = conversation.gizmo_id;
    return (typeof templateId === 'string' && templateId.startsWith('g-')) || 
           (typeof gizmoId === 'string' && gizmoId.startsWith('g-')) || 
           false;
  }

  public getTotalConversations(): number {
    return this.data.length;
  }

  public getTotalGPTsConversations(): number {
    return this.data.filter(conversation => this.isGPTsConversation(conversation)).length;
  }

  public getTotalMessages(): number {
    let totalMessages = 0;
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      totalMessages += Object.values(conversation.mapping).filter(node => node?.message !== null).length;
    });
    return totalMessages;
  }

  public getTotalGPTsMessages(): number {
    let totalMessages = 0;
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      if (this.isGPTsConversation(conversation)) {
        totalMessages += Object.values(conversation.mapping).filter(node => node?.message !== null).length;
      }
    });
    return totalMessages;
  }

  public getRoleBasedMessageCount(): Record<string, number> {
    const roleCount: Record<string, number> = {};
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const role = node?.message?.author?.role;
        if (role) {
          roleCount[role] = (roleCount[role] || 0) + 1;
        }
      });
    });
    return roleCount;
  }

  public getRoleBasedGPTsMessageCount(): Record<string, number> {
    const roleCount: Record<string, number> = {};
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      if (this.isGPTsConversation(conversation)) {
        Object.values(conversation.mapping).forEach(node => {
          const role = node?.message?.author?.role;
          if (role) {
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
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const createTime = node?.message?.create_time;
        if (createTime != null && typeof createTime === 'number') {
          const date = new Date(createTime * 1000).toISOString().split('T')[0];
          if (date && date !== 'Invalid Date') {
            dayCount[date] = (dayCount[date] || 0) + 1;
          }
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
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const createTime = node?.message?.create_time;
        if (createTime != null && typeof createTime === 'number') {
          const date = new Date(createTime * 1000);
          if (isNaN(date.getTime())) {
            shifts.unspecified++;
            return;
          }
          const hour = date.getHours();
          const minute = date.getMinutes();
          
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
      });
    });

    return { shifts, totalShiftMessages };
  }

  public getTimeSpentOnChatGPT(): { hours: number, days: number, seconds: number } {
    let totalTimeSpent = 0;
    const MAX_GAP_SECONDS = 1800; // 30 minutes - filter out gaps larger than this

    for (const conversation of this.data) {
      if (!conversation?.mapping) continue;

      const messages: Array<{ time: number; role: string }> = [];
      
      for (const node of Object.values(conversation.mapping)) {
        const message = node?.message;
        if (message?.create_time && 
            message.author?.role !== 'system' &&
            Array.isArray(message.content?.parts) && 
            message.content.parts.length > 0) {
          messages.push({
            time: message.create_time,
            role: message.author.role
          });
        }
      }

      messages.sort((a, b) => a.time - b.time);

      if (messages.length > 0) {
        // Account for time spent typing the first message
        totalTimeSpent += 30; 

        for (let i = 0; i < messages.length - 1; i++) {
          const current = messages[i];
          const next = messages[i + 1];
          
          // Count time from assistant response to next user message
          // Represents user engagement time (reading, thinking, preparing response)
          if (current.role === 'assistant' && next.role === 'user') {
            const timeDiff = next.time - current.time;
            if (timeDiff > 0 && timeDiff <= MAX_GAP_SECONDS) {
              totalTimeSpent += timeDiff;
            }
          }
        }

        // Account for time spent reading the final response if conversation ends with assistant message
        if (messages[messages.length - 1].role === 'assistant') {
          totalTimeSpent += 45; 
        }
      }
    }

    return {
      hours: parseFloat((totalTimeSpent / 3600).toFixed(2)),
      days: parseFloat((totalTimeSpent / 86400).toFixed(2)),
      seconds: parseFloat(totalTimeSpent.toFixed(2))
    };
  }

  public getAverageDailyMessageCount(): number {
    const dayCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const createTime = node?.message?.create_time;

        if (createTime != null && typeof createTime === 'number') {
          const date = new Date(createTime * 1000);
          if (!isNaN(date.getTime())) {
            const dateStr = date.toISOString().split('T')[0];
            if (dateStr && dateStr !== 'Invalid Date') {
              dayCount[dateStr] = (dayCount[dateStr] || 0) + 1;
            }
          }
        }
      });
    });

    const totalDays = Object.keys(dayCount).length;
    if (totalDays === 0) return 0;

    const totalMessagesCounted = Object.values(dayCount).reduce((sum, count) => sum + count, 0);

    return totalMessagesCounted / totalDays;
  }

  public getModelWiseMessageCount(): Record<string, number> {
    const modelCount: Record<string, number> = {};
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const role = node?.message?.author?.role;
        if ((role === 'assistant' || role === 'tool') && 
            Array.isArray(node?.message?.content?.parts) && 
            node.message.content.parts.length > 0) {
          const modelSlug = node?.message?.metadata?.model_slug ? String(node.message.metadata.model_slug) : 'unknown';
          modelCount[modelSlug] = (modelCount[modelSlug] || 0) + 1;
        }
      });
    });
    return modelCount;
  }

  public getFirstAndLastUsedDate(): { firstUsed: Date, lastUsed: Date } {
    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;
    let hasTimestamp = false;

    // Iterate and track min/max without spreading a large array (avoids stack overflow on big uploads)
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const createTime = node?.message?.create_time;
        if (createTime != null && typeof createTime === 'number' && Number.isFinite(createTime)) {
          hasTimestamp = true;
          if (createTime < minTimestamp) minTimestamp = createTime;
          if (createTime > maxTimestamp) maxTimestamp = createTime;
        }
      });
    });

    if (!hasTimestamp) {
      const now = new Date();
      return { firstUsed: now, lastUsed: now };
    }

    const firstUsed = new Date(minTimestamp * 1000);
    const lastUsed = new Date(maxTimestamp * 1000);

    return { firstUsed, lastUsed };
  }

  public getDateWiseActivity(): Record<string, { totalMessages: number, totalConversations: number }> {
    const dateWiseActivity: Record<string, { totalMessages: number, totalConversations: number }> = {};
  
    this.data.forEach(conversation => {
      if (!conversation) return;
      
      if (typeof conversation.create_time === 'number') {
        const conversationDate = new Date(conversation.create_time * 1000).toISOString().split('T')[0];
        if (conversationDate && conversationDate !== 'Invalid Date') {
          if (!dateWiseActivity[conversationDate]) {
            dateWiseActivity[conversationDate] = { totalMessages: 0, totalConversations: 0 };
          }
          dateWiseActivity[conversationDate].totalConversations++;
        }
      }
  
      if (conversation.mapping) {
        Object.values(conversation.mapping).forEach(node => {
          const createTime = node?.message?.create_time;
          if (createTime != null && typeof createTime === 'number') {
            const messageDate = new Date(createTime * 1000).toISOString().split('T')[0];
            if (messageDate && messageDate !== 'Invalid Date') {
              if (!dateWiseActivity[messageDate]) {
                dateWiseActivity[messageDate] = { totalMessages: 0, totalConversations: 0 };
              }
              dateWiseActivity[messageDate].totalMessages++;
            }
          }
        });
      }
    });
  
    return dateWiseActivity;
  }

  public getTotalArchivedConversations(): number {
    return this.data.filter(conversation => conversation?.is_archived === true).length;
  }

  public getDefaultModelSlugCount(): Record<string, number> {
    const modelSlugCount: Record<string, number> = {};
  
    this.data.forEach(conversation => {
      if (!conversation) return;
      const modelSlug = (typeof conversation.default_model_slug === 'string') 
        ? conversation.default_model_slug 
        : 'unknown';
      modelSlugCount[modelSlug] = (modelSlugCount[modelSlug] || 0) + 1;
    });
  
    return modelSlugCount;
  }

  public getModelAdjustmentsCount(): Record<string, number> {
    const adjustmentsCount: Record<string, number> = {};
  
    this.data.forEach((conversation: ConversationData) => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach((node: ConversationNode) => {
        if (node?.message?.author?.role === 'assistant' &&
            Array.isArray(node.message.metadata?.model_adjustments)) {
          node.message.metadata.model_adjustments.forEach((adjustment: any) => {
            if (typeof adjustment === 'string') {
              adjustmentsCount[adjustment] = (adjustmentsCount[adjustment] || 0) + 1;
            }
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
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach((node: ConversationNode) => {
        const role = node?.message?.author?.role;
        const status = node?.message?.status;
        if (status && (role === 'user' || role === 'assistant')) {
          if (!statusCount[role]) {
            statusCount[role] = {};
          }
          const statusStr = String(status);
          statusCount[role][statusStr] = (statusCount[role][statusStr] || 0) + 1;
        }
      });
    });
  
    return statusCount;
  }

  public getFinishDetailsTypeCount(): Record<string, number> {
    const finishDetailsTypeCount: Record<string, number> = {};
  
    this.data.forEach((conversation: ConversationData) => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach((node: ConversationNode) => {
        const finishType = node?.message?.metadata?.finish_details?.type;
        if (typeof finishType === 'string') {
          finishDetailsTypeCount[finishType] = (finishDetailsTypeCount[finishType] || 0) + 1;
        }
      });
    });
  
    return finishDetailsTypeCount;
  }

  public getTotalVoiceMessages(): number {
    let totalVoiceMessages = 0;
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        if (node?.message?.metadata?.voice_mode_message) {
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
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const role = node?.message?.author?.role;
        if (node?.message?.metadata?.voice_mode_message && 
            (role === 'user' || role === 'assistant')) {
          roleVoiceCount[role] = (roleVoiceCount[role] || 0) + 1;
        }
      });
    });
    return roleVoiceCount;
  }

  public getDALLEImageCount(): number {
    const dalleGizmoId = 'g-2fkFE8rbu';
    let dalleImageCount = 0;

    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        if (node?.message?.author?.role === 'assistant' && 
            node.message.metadata?.gizmo_id === dalleGizmoId &&
            Array.isArray(node.message.content?.parts) && 
            node.message.content.parts.length > 0) {
          const parts = node.message.content.parts;
          if (parts.some(part => typeof part === 'string' && part.toLowerCase().includes('prompt'))) {
            dalleImageCount++;
          }
        }
      });
    });

    return dalleImageCount;
  }

  public getDALLEImageCountWithoutGizmo(): number {
    let dalleImageCount = 0;

    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        if (node?.message?.author?.role === 'tool' && 
            node.message.author.name === 'dalle.text2im' &&
            Array.isArray(node.message.content?.parts) && 
            node.message.content.parts.length > 0) {
          const parts = node.message.content.parts;
          const dallePart = parts.find(part => 
            part && 
            typeof part === 'object' &&
            part !== null &&
            part.metadata && 
            typeof part.metadata === 'object' &&
            part.metadata.dalle && 
            typeof part.metadata.dalle === 'object' &&
            part.metadata.dalle.gen_id && 
            part.metadata.dalle.prompt
          );
          if (dallePart) {
            dalleImageCount++;
          }
        }
      });
    });

    return dalleImageCount;
  }

  public getPictureV2ImageCount(): number {
    const pictureV2ToolName = 't2uay3k.sj1i4kz';
    let pictureV2ImageCount = 0;
  
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        if (node?.message?.author?.role === 'tool' && 
            node.message.author.name === pictureV2ToolName &&
            Array.isArray(node.message.content?.parts) && 
            node.message.content.parts.length > 0) {
          const parts = node.message.content.parts;
          const imageParts = parts.filter(part => 
            part && 
            typeof part === 'object' &&
            part !== null &&
            part.content_type === 'image_asset_pointer' &&
            part.metadata && 
            typeof part.metadata === 'object' &&
            (part.metadata.dalle || part.metadata.generation)
          );
          pictureV2ImageCount += imageParts.length;
        }
      });
    });
  
    return pictureV2ImageCount;
  }
  
  public getUserAttachmentMimeTypeCount(): Record<string, number> {
    const mimeTypeCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        if (node?.message?.author?.role === 'user' && 
            Array.isArray(node.message.metadata?.attachments)) {
          node.message.metadata.attachments.forEach(attachment => {
            if (attachment?.mime_type && typeof attachment.mime_type === 'string') {
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
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const toolName = node?.message?.author?.name;
        if (node?.message?.author?.role === 'tool' && 
            typeof toolName === 'string') {
          toolNameCount[toolName] = (toolNameCount[toolName] || 0) + 1;
        }
      });
    });

    return toolNameCount;
  }

  public getRecipientCount(): Record<string, number> {
    const recipientCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const recipient = node?.message?.recipient;
        const recipientStr = recipient != null ? String(recipient) : 'unknown';
        recipientCount[recipientStr] = (recipientCount[recipientStr] || 0) + 1;
      });
    });

    return recipientCount;
  }

  public getChannelCount(): Record<string, number> {
    const channelCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const channel = node?.message?.channel;
        const channelStr = channel != null ? String(channel) : 'unknown';
        channelCount[channelStr] = (channelCount[channelStr] || 0) + 1;
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
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const requestId = node?.message?.metadata?.request_id;
        const role = node?.message?.author?.role;
        if (typeof requestId === 'string' && (role === 'user' || role === 'assistant')) {
          const parts = requestId.split('-');
          const locationCode = parts.length > 0 ? parts[parts.length - 1] : null;
          if (locationCode && locationCode.length === 3) {
            if (!locationCodeCount[role]) {
              locationCodeCount[role] = {};
            }
            locationCodeCount[role][locationCode] = (locationCodeCount[role][locationCode] || 0) + 1;
          }
        }
      });
    });
  
    return locationCodeCount;
  }

  public getRequestedModelCount(): Record<string, number> {
    const modelMessageCount: Record<string, number> = {};

    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const requestedModelSlug = node?.message?.metadata?.requested_model_slug;
        if (node?.message?.author?.role === 'assistant' && requestedModelSlug) {
          const modelSlug = String(requestedModelSlug);
          modelMessageCount[modelSlug] = (modelMessageCount[modelSlug] || 0) + 1;
        }
      });
    });

    return modelMessageCount;
  }

  public getAssistantGeneratedCodeBlockCount(): Record<string, number> {
    const codeBlockCount: Record<string, number> = {};
  
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        if (node?.message?.author?.role === 'assistant' && 
            Array.isArray(node.message.content?.parts)) {
          node.message.content.parts.forEach(part => {
            if (typeof part === 'string') {
              const codeBlockRegex = /```(\w+)/g;
              let match;
              while ((match = codeBlockRegex.exec(part)) !== null) {
                if (match[1]) {
                  const langName = match[1];
                  codeBlockCount[langName] = (codeBlockCount[langName] || 0) + 1;
                }
              }
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
    if (!conversation?.mapping || !userMessageId) {
      return "unknown";
    }
    const userNode = conversation.mapping[userMessageId];
    if (!Array.isArray(userNode?.children) || userNode.children.length === 0) {
      return "unknown";
    }
    const assistantNode = conversation.mapping[userNode.children[0]];
    const modelSlug = assistantNode?.message?.metadata?.model_slug;
    return (typeof modelSlug === 'string') ? modelSlug : "unknown";
}

// Helper method to get local month from timestamp
private getLocalMonth(timestamp: number | null): number | null {
    if (timestamp === null || typeof timestamp !== 'number') return null;
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return null;
    return date.getMonth();
}

// Helper method to get local full year from timestamp
private getLocalFullYear(timestamp: number | null): number | null {
    if (timestamp === null || typeof timestamp !== 'number') return null;
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return null;
    return date.getFullYear();
}

// Helper method to get model slug from message, node, and mapping
private getModelSlug(message: Message, node: ConversationNode, mapping: Record<string, ConversationNode>): string {
    if (!message?.metadata) {
      return "unknown";
    }
    const modelSlug = message.metadata.model_slug;
    if (typeof modelSlug === 'string') {
      return modelSlug;
    }
    // For user messages, try to get model slug from the assistant response
    if (message.author?.role === 'user' && 
        Array.isArray(node?.children) && node.children.length > 0) {
      const assistantNode = mapping[node.children[0]];
      const assistantModelSlug = assistantNode?.message?.metadata?.model_slug;
      if (typeof assistantModelSlug === 'string') {
        return assistantModelSlug;
      }
    }
    return "unknown";
}

public getMonthlyModelWiseTokenUsage(): MonthlyUsage {
    const monthlyUsage: MonthlyUsage = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (const conversation of this.data) {
        const mapping = conversation?.mapping ?? {};

        for (const node of Object.values(mapping)) {
            const message = node?.message;

            // Guard clauses
            if (!message?.create_time || !Array.isArray(message.content?.parts)) {
                continue;
            }

            const role = message.author?.role;

            if (role !== "user" && role !== "assistant") {
                continue;
            }

            // Extract and count tokens
            const messageText = message.content.parts
                .filter((part): part is string => typeof part === "string")
                .join(" ");

            const tokenCount = this.tokenCounter.countTokens(messageText);
            if (tokenCount === 0) {
                continue;
            }

            // Get time and model metadata using local timezone
            const month = this.getLocalMonth(message.create_time);
            const year = this.getLocalFullYear(message.create_time);

            if (month === null || year === null) {
                continue;
            }

            const monthYear = `${monthNames[month]}-${year.toString().slice(-2)}`;
            const modelSlug = this.getModelSlug(message, node, mapping);

            // Initialize nested structure
            monthlyUsage[monthYear] ??= {};
            monthlyUsage[monthYear][modelSlug] ??= { userTokens: 0, assistantTokens: 0 };

            // Accumulate tokens
            if (role === "user") {
                monthlyUsage[monthYear][modelSlug].userTokens += tokenCount;
            } else {
                monthlyUsage[monthYear][modelSlug].assistantTokens += tokenCount;
            }
        }
    }

    return monthlyUsage;
}

public cleanup(): void {
    this.tokenCounter.free();
}

  public getCustomInstructionMessageCount(): number {
    const customInstructionCount = this.data.reduce((count, conversation) => {
      if (!conversation?.mapping) return count;
      return count + Object.values(conversation.mapping)
          .filter(node => 
              node?.message?.author?.role === 'user' && 
              node.message.metadata?.is_user_system_message === true
          ).length;
    }, 0);
    
    return customInstructionCount;
  }

  public getUserTargetedReplyCount(): number {
    const targetedReplyCount = this.data.reduce((count, conversation) => {
      if (!conversation?.mapping) return count;
      return count + Object.values(conversation.mapping)
          .filter(node => 
              node?.message?.author?.role === 'user' && 
              node.message.metadata?.targeted_reply
          ).length;
    }, 0);

    return targetedReplyCount;
  }

  public getUserSystemHintsCount(): Record<string, number> {
    const systemHintsCount: Record<string, number> = {};
  
    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        if (node?.message?.author?.role === 'user' && 
            Array.isArray(node.message.metadata?.system_hints)) {
          node.message.metadata.system_hints.forEach((hint: any) => {
            if (typeof hint === 'string') {
              systemHintsCount[hint] = (systemHintsCount[hint] || 0) + 1;
            }
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
        if (!conversation?.mapping) continue;
        for (const node of Object.values(conversation.mapping)) {
          const message = node?.message;
          if (!message?.author) continue;
          
          // Check for the older format
          const metadataList = message.metadata?._cite_metadata?.metadata_list;
          if (message.author.role === 'tool' && Array.isArray(metadataList)) {
            webpageCount += metadataList.filter(item => 
              item && 
              typeof item === 'object' && 
              item.type === 'webpage'
            ).length;
          }
          
          // Check for the newer format in content_references
          const contentReferences = message.metadata?.content_references;
          if (Array.isArray(contentReferences)) {
            webpageCount += contentReferences.filter(ref => 
              ref && 
              typeof ref === 'object' &&
              (ref.type === 'webpage' || 
               ref.type === 'grouped_webpages' ||
               ref.type === 'webpage_extended')
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
      if (!conversation?.mapping) continue;
      const messageCount = Object.values(conversation.mapping)
        .filter(node => node?.message !== null).length;
      
      if (messageCount === 0) continue;

      const roleDistribution: Record<string, number> = {};
      const allTimestamps: number[] = [];

      Object.values(conversation.mapping).forEach(node => {
        const role = node?.message?.author?.role;
        if (role) {
          roleDistribution[role] = (roleDistribution[role] || 0) + 1;
        }

        const createTime = node?.message?.create_time;
        if (createTime != null && typeof createTime === 'number') {
          allTimestamps.push(createTime);
        }
        const updateTime = node?.message?.update_time;
        if (updateTime != null && typeof updateTime === 'number') {
          allTimestamps.push(updateTime);
        }
      });

      if (allTimestamps.length > 0) {
        const firstUsed = new Date(Math.min(...allTimestamps) * 1000);
        const lastUsed = new Date(Math.max(...allTimestamps) * 1000);
        
        if (!isNaN(firstUsed.getTime()) && !isNaN(lastUsed.getTime())) {
          if (longestConversation === null || messageCount > longestConversation.messageCount) {
            longestConversation = {
              id: conversation.id || 'unknown',
              title: conversation.title || 'Untitled',
              messageCount,
              roleDistribution,
              firstUsed,
              lastUsed
            };
          }
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
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const canvas = node?.message?.metadata?.canvas;
        if (!canvas || canvas.textdoc_type !== 'document') return;

        // Emoji
        const emojiPrompt = canvas.accelerator_metadata?.id === 'emoji' 
          ? canvas.accelerator_metadata.prompt 
          : null;
        if (node?.message?.author?.role === 'user' && typeof emojiPrompt === 'string') {
          totalEmojiEdits++;
          if (emojiPrompt === "Replace as many words as possible with emojis.") {
            wordsEmojiEdits++;
          } else if (emojiPrompt === "Add three emojis at the start or end of every major section or paragraph to give subtle decoration. Do not change the structure of the original text. Do not add emojis to lists.") {
            sectionsEmojiEdits++;
          } else if (emojiPrompt === "Add emojis to lists for visual flair. Do not change the structure of the original text.") {
            listsEmojiEdits++;
          } else if (emojiPrompt === "Remove emojis") {
            removeEmojiEdits++;
          }
        }

        // Suggest Edits and comments
        if (node?.message?.author) {
          // Count Suggest Edits (only for textdoc_type: "document")
          if (node.message.author.role === 'user' &&
              canvas.accelerator_metadata?.id === 'suggest') {
            totalSuggestEdits++;
          }

          // Count Comments (only for textdoc_type: "document")
          if (node.message.author.role === 'tool' &&
              node.message.author.name === 'canmore.comment_textdoc' &&
              Array.isArray(canvas.comment_ids)) {
            totalCommentsAdded += canvas.comment_ids.length;
          }
        }

        // Final Polish
        if (node?.message?.author?.role === 'user' &&
            canvas.accelerator_metadata?.id === 'polish') {
          finalPolishCount++;
        }

        // Reading level
        const readingLevelPrompt = canvas.accelerator_metadata?.id === 'reading-level'
          ? canvas.accelerator_metadata.prompt
          : null;
        if (node?.message?.author?.role === 'user' && typeof readingLevelPrompt === 'string') {
          totalReadingLevelEdits++;
          if (readingLevelPrompt === "Rewrite this text at the reading level of a doctoral writer in this subject. You may reply that you adjusted the text to reflect a graduate school reading level, but do not mention the prompt.") {
            graduateLevelEdits++;
          } else if (readingLevelPrompt === "Rewrite this text at the reading level of a college student majoring in this subject") {
            collegeLevelEdits++;
          } else if (readingLevelPrompt === "Rewrite this text at the reading level of a high school student who has taken a couple of classes in this subject.") {
            highSchoolLevelEdits++;
          } else if (readingLevelPrompt === "Rewrite this text at the reading level of a middle schooler.") {
            middleSchoolLevelEdits++;
          } else if (readingLevelPrompt === "Rewrite this text at the reading level of a kindergartener.") {
            kindergartenLevelEdits++;
          }
        }

        // Length Adjustments
        const lengthPrompt = canvas.accelerator_metadata?.id === 'length'
          ? canvas.accelerator_metadata.prompt
          : null;
        if (node?.message?.author?.role === 'user' && typeof lengthPrompt === 'string') {
          totalLengthEdits++;
          if (lengthPrompt === "Make this text 75% longer.") {
            longestEdits++;
          } else if (lengthPrompt === "Make this text 50% longer.") {
            longerEdits++;
          } else if (lengthPrompt === "Make this text 50% shorter.") {
            shorterEdits++;
          } else if (lengthPrompt === "Make this text 75% shorter.") {
            shortestEdits++;
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
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const canvas = node?.message?.metadata?.canvas;
        if (!canvas?.textdoc_type || typeof canvas.textdoc_type !== 'string' || !canvas.textdoc_type.startsWith('code/')) return;

        const lang = canvas.textdoc_type.split('/').pop();
        if (!lang) return;

        // Code Comment
        if (node?.message?.author?.role === 'user' &&
            canvas.accelerator_metadata?.id === 'comments') {
          codeCommentCounts.total++;
          codeCommentCounts[lang] = (codeCommentCounts[lang] || 0) + 1;
        }

        // Code Log
        if (node?.message?.author?.role === 'user' &&
            canvas.accelerator_metadata?.id === 'logs') {
          codeLogCounts.total++;
          codeLogCounts[lang] = (codeLogCounts[lang] || 0) + 1;
        }

        // Code Fix Bug
        if (node?.message?.author?.role === 'user' &&
            canvas.accelerator_metadata?.id === 'bugs') {
          codeFixBugCounts.total++;
          codeFixBugCounts[lang] = (codeFixBugCounts[lang] || 0) + 1;
        }
        
        // Code Review & Comments
        if (node?.message?.author) {
          // Count Code Reviews
          if (node.message.author.role === 'user' &&
              canvas.accelerator_metadata?.id === 'review') {
            codeReviewAndCommentCounts.total.reviews++;
            codeReviewAndCommentCounts[lang] = codeReviewAndCommentCounts[lang] || { reviews: 0, comments: 0 };
            codeReviewAndCommentCounts[lang].reviews++;
          }
  
          // Count Code Comments
          if (node.message.author.role === 'tool' &&
              node.message.author.name === 'canmore.comment_textdoc' &&
              Array.isArray(canvas.comment_ids)) {
            codeReviewAndCommentCounts.total.comments += canvas.comment_ids.length;
            codeReviewAndCommentCounts[lang] = codeReviewAndCommentCounts[lang] || { reviews: 0, comments: 0 };
            codeReviewAndCommentCounts[lang].comments += canvas.comment_ids.length;
          }
        }
      
        // Code Port
        const portPrompt = canvas.accelerator_metadata?.id === 'port'
          ? canvas.accelerator_metadata.prompt
          : null;
        if (node?.message?.author?.role === 'user' && typeof portPrompt === 'string') {
          totalCodePortEdits++;
          if (portPrompt === "Create a new document that rewrites the code in PHP") {
            phpEdits++;
          } else if (portPrompt === "Create a new document that rewrites the code in C++") {
            cppEdits++;
          } else if (portPrompt === "Create a new document that rewrites the code in Python") {
            pythonEdits++;
          } else if (portPrompt === "Create a new document that rewrites the code in JavaScript") {
            javascriptEdits++;
          } else if (portPrompt === "Create a new document that rewrites the code in TypeScript") {
            typescriptEdits++;
          } else if (portPrompt === "Create a new document that rewrites the code in Java") {
            javaEdits++;
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
      if (!conversation?.mapping) continue;
      for (const node of Object.values(conversation.mapping)) {
        const textdocType = node?.message?.metadata?.canvas?.textdoc_type;
        if (node?.message?.author?.role === 'tool' &&
            typeof textdocType === 'string' &&
            textdocType.startsWith('code/')) {
          canvasCodeBlockCount.total++;
          const lang = textdocType.split('/').pop();
          if (lang) {
            canvasCodeBlockCount[lang] = (canvasCodeBlockCount[lang] || 0) + 1;
          }
        }
      }
    }
    return canvasCodeBlockCount;
  }

  public getDefaultAndSpecificModelMessageCount(): { defaultModelCount: number, specificModelCount: number } {
    let defaultModelCount = 0;
    let specificModelCount = 0;

    this.data.forEach(conversation => {
      if (!conversation?.mapping) return;
      Object.values(conversation.mapping).forEach(node => {
        const defaultModelSlug = node?.message?.metadata?.default_model_slug;
        if (defaultModelSlug !== undefined) {
          if (defaultModelSlug === 'auto') {
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
