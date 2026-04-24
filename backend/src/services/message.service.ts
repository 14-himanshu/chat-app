import { Message } from "../models/Message.js";
import type { MessageType } from "../models/Message.js";
import type mongoose from "mongoose";

const HISTORY_LIMIT = 50;

export interface SerializedMessage {
  id: string;
  roomId: string;
  username: string;
  message: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
}

/** Persist a chat message (text or file) to the database */
export async function saveMessage(
  roomId: string,
  userId: mongoose.Types.ObjectId | string,
  username: string,
  message: string,
  type: MessageType = "text",
  fileUrl?: string,
  fileName?: string
): Promise<SerializedMessage> {
  const doc = await Message.create({
    roomId, userId, username, message, type,
    ...(fileUrl   ? { fileUrl }   : {}),
    ...(fileName  ? { fileName }  : {}),
  });
  return serialize(doc);
}

/** Fetch the most recent N messages for a room (chronological order) */
export async function getRoomHistory(roomId: string): Promise<SerializedMessage[]> {
  const docs = await Message.find({ roomId })
    .sort({ timestamp: -1 })
    .limit(HISTORY_LIMIT)
    .lean();
  return docs.reverse().map(serialize);
}

function serialize(doc: {
  _id: mongoose.Types.ObjectId;
  roomId: string;
  username: string;
  message: string;
  type?: MessageType;
  fileUrl?: string;
  fileName?: string;
  timestamp: Date;
}): SerializedMessage {
  return {
    id:        doc._id.toString(),
    roomId:    doc.roomId,
    username:  doc.username,
    message:   doc.message,
    type:      doc.type ?? "text",
    timestamp: doc.timestamp.toISOString(),
    ...(doc.fileUrl  ? { fileUrl:  doc.fileUrl }  : {}),
    ...(doc.fileName ? { fileName: doc.fileName } : {}),
  };
}
