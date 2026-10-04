export interface VoicePeer {
  socketId: string;
  userId: string;
  userName: string;
  isMuted: boolean;
}

export interface VoiceSignalPayload {
  toSocketId: string;
  signal: any; // SDP offer, answer, or ICE candidate
}

export interface VoiceMutePayload {
  roomId: string;
  isMuted: boolean;
}
