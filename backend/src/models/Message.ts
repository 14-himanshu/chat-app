import mongoose, { type Document, Schema } from "mongoose";

export type MessageType = "text" | "image" | "file";

export interface IMessage extends Document {
  roomId: string;
  userId: mongoose.Types.ObjectId;
  username: string;
  message: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
  roomId:   { type: String, required: true, index: true },
  userId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  message:  { type: String, required: true, maxlength: 2000 },
  type:     { type: String, enum: ["text", "image", "file"], default: "text" },
  fileUrl:  { type: String },
  fileName: { type: String },
  timestamp: { type: Date, default: () => new Date() },
});

messageSchema.index({ roomId: 1, timestamp: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);

