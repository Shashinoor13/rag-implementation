import { apiCall } from '../api';

export interface ChatHistoryItem {
  id: string;
  title: string;
}

export interface QueryMessage {
  id: string;
  text: any; // can be string or object
  type: string;
  created_at: string;
  revalidations?: Revalidation[];
}

export interface Revalidation {
  id: string;
  version: number;
  regenerated_response: string;
  regenerated_at: string;
}

export interface ChatHistoryResponse {
  chats: ChatHistoryItem[];
}

export interface ChatMessagesResponse {
  chat_id: string;
  title: string;
  queries: QueryMessage[];
}

export interface QueryRequest {
  query: string;
  chat_id: string;
}

export const chatActions = {
  getChatHistory: async () => {
    return apiCall<ChatHistoryResponse>({
      url: '/history',
      method: 'GET',
    });
  },

  getChatMessages: async (chatId: string) => {
    return apiCall<ChatMessagesResponse>({
      url: `/history/chat/${chatId}`,
      method: 'GET',
    });
  },

  sendQuery: async (data: QueryRequest) => {
    return apiCall({
      url: '/query/',
      method: 'POST',
      data,
    });
  },

  revalidateResponse: async (queryId: string) => {
    return apiCall({
      url: '/revalidate/',
      method: 'POST',
      data: { query_id: queryId },
    });
  },
}; 