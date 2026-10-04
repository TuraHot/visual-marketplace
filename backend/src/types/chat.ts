export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export interface SendMessagePayload {
  sellerId: string;
  buyerId: string;
  message: string;
}

export interface ChatSessionCheck {
  canChat: boolean;
  reason?: string;
  shopCoordinates?: { x: number; y: number };
}
