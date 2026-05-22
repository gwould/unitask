import type { Conversation, ChatMessage } from '../types/messaging';
import { apiGet, apiPost } from './apiService';
import { unwrapPaged, type PagedResult } from '../utils/paged';
import { hasAuthToken } from '../utils/auth';

type ApiConversation = {
  id: string;
  otherUser: { id: string; name: string; avatarUrl?: string | null };
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
};

type ApiMessage = {
  id: string;
  conversationId: string;
  content: string;
  attachmentUrl?: string | null;
  isRead?: boolean | null;
  createdAt?: string | null;
  sender: { id: string; name: string; avatarUrl?: string | null };
};

function mapConversation(c: ApiConversation): Conversation {
  return {
    id: c.id,
    otherUser: c.otherUser,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt,
    unreadCount: c.unreadCount,
  };
}

function mapMessage(m: ApiMessage, currentUserId: string): ChatMessage {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.sender.id,
    senderName: m.sender.name,
    content: m.content,
    attachmentUrl: m.attachmentUrl,
    isRead: m.isRead,
    createdAt: m.createdAt ?? new Date().toISOString(),
    isMine: String(m.sender.id) === String(currentUserId),
  };
}

export const conversationService = {
  async list(): Promise<Conversation[]> {
    if (!hasAuthToken()) return [];
    const rows = await apiGet<ApiConversation[]>('/api/conversations');
    return rows.map(mapConversation);
  },

  async start(recipientUserId: string): Promise<Conversation> {
    const row = await apiPost<ApiConversation>('/api/conversations/start', {
      recipientId: recipientUserId,
    });
    return mapConversation(row);
  },

  async getMessages(
    conversationId: string,
    currentUserId: string,
    page = 1,
    limit = 50,
  ): Promise<ChatMessage[]> {
    const result = await apiGet<PagedResult<ApiMessage>>(
      `/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    );
    const items = unwrapPaged(result);
    return items
      .map((m) => mapMessage(m, currentUserId))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(conversationId: string, content: string): Promise<void> {
    await apiPost(`/api/conversations/${conversationId}/messages`, { content });
  },
};
