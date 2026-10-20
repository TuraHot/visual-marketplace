export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface ChatSendPayload {
  sellerId: string;
  buyerId: string;
  senderId: string;
  senderName: string;
  message: string;
}

export interface ChatJoinPayload {
  sellerId: string;
  buyerId: string;
  userId: string;
}

export interface ChatTypingPayload {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ChatError {
  code: 'EMPTY_MESSAGE' | 'MESSAGE_TOO_LONG' | 'INVALID_PAYLOAD' | 'NOT_IN_ROOM' | 'SHOP_CLOSED';
  message: string;
}
