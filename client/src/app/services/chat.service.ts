import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { takeLast, BehaviorSubject } from 'rxjs';

export interface Chat {
  id: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  userIds: number[];

  chatname?: string;
}

export interface Message {
  text: string;
  senderId: string;
  chat_id: string;
  sentDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private ws: WebSocket | null = null;
  private messagesSubject: Subject<Message> = new Subject();
  // private messagesSubject = new BehaviorSubject<Message | null>(null);
  // private messagesSubject = new BehaviorSubject<Message>(null);
  constructor(private http: HttpClient) {}

  connect(user1: string, user2: string): void {
    if (this.ws) {
      this.ws.close();
    }

    // Подключение по WebSocket для конкретных пользователей
    this.ws = new WebSocket(`ws://localhost:5000/ws/chat/${user1}/${user2}`);
    this.ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      this.messagesSubject.next(message); // Передаём сообщение в поток
      console.log(this.messagesSubject);
    };

    console.log(this.messagesSubject);

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendMessage(user1: string, user2: string, message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          message: message, // Сообщение от текущего пользователя
          sender_id: user1, // ID отправителя
        })
      );
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

  getMessage(): Observable<Message> {
    return this.messagesSubject.asObservable();
  }
  // getMessage(){
  //   if (this.ws){
  //     this.ws.subscribe(
  //       (message) => this.messagesSubject.next(message));
  //   }
  // }

  getMessagesAll(user1: string, user2: string): Observable<Message[]> {
    return this.http.get<Message[]>(`http://localhost:5000/api/messages/${user1}/${user2}`);
  }
}