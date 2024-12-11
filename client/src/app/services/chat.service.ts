import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';

export interface Chat {
  id: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  userIds: number[];

  chatname?: string;
}

export interface Message {
  text: string;
  senderId: number;
  recipientId: number;
  sentDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private ws: WebSocket | null = null;
  private messagesSubject: Subject<Message> = new Subject();

  constructor() {}

  connect(chat_id: string): void {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(`ws://localhost:5000/ws/${chat_id}`);
    this.ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      this.messagesSubject.next(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendMessage(message: Message): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        text: message.text,
        sender_id: message.senderId,
        recipient_id: message.recipientId,
        sent_date: message.sentDate.toISOString(),
      }));
    } else {
      console.error('WebSocket is not connected.');
    }
  }
  
  closeConnection(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getMessages(): Observable<Message> {
    return this.messagesSubject.asObservable();
  }
}