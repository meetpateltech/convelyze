export const readJsonFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const readJsonFiles = async (files: File[]): Promise<Array<{ file: File; json: any }>> => {
  return Promise.all(
    files.map(async (file) => ({
      file,
      json: await readJsonFile(file),
    }))
  );
};

const getConversationTimestamp = (conversation: any): number => {
  if (typeof conversation.update_time === 'number') {
    return conversation.update_time;
  }

  if (typeof conversation.create_time === 'number') {
    return conversation.create_time;
  }

  return 0;
};

export const mergeConversationExports = (exportBatches: any[][]): any[] => {
  const conversationsById = new Map<string, any>();
  const conversationsWithoutId: any[] = [];

  exportBatches.forEach((batch) => {
    batch.forEach((conversation) => {
      if (!conversation || typeof conversation !== 'object') {
        return;
      }

      const conversationId =
        typeof conversation.id === 'string' && conversation.id.trim().length > 0
          ? conversation.id
          : null;

      if (!conversationId) {
        conversationsWithoutId.push(conversation);
        return;
      }

      const existingConversation = conversationsById.get(conversationId);
      if (!existingConversation) {
        conversationsById.set(conversationId, conversation);
        return;
      }

      if (getConversationTimestamp(conversation) >= getConversationTimestamp(existingConversation)) {
        conversationsById.set(conversationId, conversation);
      }
    });
  });

  return [...conversationsById.values(), ...conversationsWithoutId].sort(
    (left, right) => getConversationTimestamp(right) - getConversationTimestamp(left)
  );
};
