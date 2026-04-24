export type MessageType = "text" | "image" | "file";

export interface Message {
    id: string;
    text: string;
    timestamp: Date;
    username: string;
    type: MessageType;
    fileUrl?: string;
    fileName?: string;
}
