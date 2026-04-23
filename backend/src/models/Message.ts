import mongoose, { type Document, Schema } from "mongoose";

export interface IMessage extends Document {
  roomId: string;
  userId: mongoose.Types.ObjectId;
  username: string; // denormalised for fast reads
  message: string;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
  roomId: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  message: { type: String, required: true, maxlength: 2000 },
  timestamp: { type: Date, default: () => new Date() },
});

// Compound index for efficient room history queries sorted by time
messageSchema.index({ roomId: 1, timestamp: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
