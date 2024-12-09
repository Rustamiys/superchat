import { ProfileUser } from "./user-profile";

export interface Chat {
  id: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  userIds: string[];
  users: ProfileUser[];

  chatPic?: string;
  chatname?: string;
}

export interface Message {
  text: string;
  senderId: string;
  sentDate: Date;
}
