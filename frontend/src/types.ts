// Shared TypeScript types for the entire frontend

export type MessageType = "text" | "image" | "file";

export interface Reaction {
  icon: string;
  userId: string;
  username: string;
}

export interface Message {
  id: string;
  roomId: string;
  userId?: string;
  username: string;
  text: string;
  timestamp: Date;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
  edited?: boolean;
  deleted?: boolean;
  replyTo?: string | Message;
  reactions?: Reaction[];
}

export type UserStatus = "online" | "offline" | "busy" | "away";

export interface UserProfile {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  status: UserStatus;
  lastSeen: string;
  createdAt: string;
}
