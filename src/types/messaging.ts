export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl?: string | null;
  isRead?: boolean | null;
  createdAt: string;
  isMine: boolean;
}
