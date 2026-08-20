// src/services/messagingService.ts
import { apiFetch } from "./http";

export type ConversationType = "PRIVATE" | "GROUP";

export type ConversationSummaryApi = {
  id: number;
  name: string;
  type: ConversationType;
  memberCount: number | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type MessageApi = {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
};

export function fetchConversations(): Promise<ConversationSummaryApi[]> {
  return apiFetch<ConversationSummaryApi[]>("/conversations");
}

export function fetchMessages(conversationId: number): Promise<MessageApi[]> {
  return apiFetch<MessageApi[]>(`/conversations/${conversationId}/messages`);
}

export function sendMessageApi(conversationId: number, content: string): Promise<MessageApi> {
  return apiFetch<MessageApi>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function markConversationRead(conversationId: number): Promise<void> {
  return apiFetch<void>(`/conversations/${conversationId}/read`, { method: "POST" });
}