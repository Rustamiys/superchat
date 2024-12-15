import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormControl} from '@angular/forms';
import { MatFormFieldModule,} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { User, UserService } from '../services/user.service';
import { CommonModule } from '@angular/common'
import { ChatService } from '../services/chat.service';
import { Message } from '../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { pipe , Observable, take, BehaviorSubject} from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    MatDividerModule, 
    MatFormFieldModule, 
    MatListModule,
    MatInputModule, 
    MatAutocompleteModule, 
    MatIconModule,
    HttpClientModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit{
  searchControl = new FormControl('');
  messageControl = new FormControl('');
  chatListControl = new FormControl('');
  selectedChat$: User | null = null;
  chat: Message[] = [];
  THIS_BUFFER: Message[] = [];
  user_id: string = '';
  user$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  myChats$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  @ViewChild('endOfChat') endOfChat!: ElementRef;
  constructor(private userService: UserService, private chatService: ChatService, private route: ActivatedRoute) {         
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        const filteredUsers = data.filter(user => user.login !== this.user_id);
        this.myChats$.next(filteredUsers); // Обновляем поток с чатами

        const currentUser = data.find(user => user.login === this.user_id);
        if (currentUser) {
          console.log('Текущий пользователь:', currentUser);
          this.user$.next(currentUser); // Устанавливаем текущего пользователя
        } else {
          console.error('Текущий пользователь не найден');
        }
      },
      error: (error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      },
    });
  }

  ngOnInit(): void {
    // Подписка на изменения параметров маршрута
    this.route.paramMap.subscribe(params => {
      this.user_id = params.get('id') || '';  // Correct the closing parenthesis
    });
    this.chatService.getMessage().subscribe({
      next: (message) => {
        console.log('Новое сообщение:', message);
        this.chat.push(message);
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (error) => {
        console.error('Ошибка получения сообщения:', error);
      },
    }); 
  }  

  scrollToBottom(): void {
    try {
      this.endOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Ошибка при прокрутке:', err);
    }
  }

  select(login: string): void {
    this.myChats$.pipe(take(1)).subscribe((chats) => {
      console.log(chats);
      const selectedChat = chats.find((user) => user.login === login) || null;
      this.selectedChat$ = selectedChat;
  
      if (this.selectedChat$) {
        this.chatService.connect(this.user_id, this.selectedChat$.login);
        this.chatService.getMessagesAll(this.user_id, this.selectedChat$.login).subscribe({
          next: (data) => {
            this.chat = data;
            console.log('Загруженные сообщения:', data);
            setTimeout(() => this.scrollToBottom(), 0);
          },
          error: (error) => {
            console.error('Ошибка при загрузке сообщений:', error);
          },
        });
        this.scrollToBottom(); 
      }
    });
  }  

  
  sendMessage(): void {
    console.log('Message sent!');
    
    const message: Message = {
      text: "test", 
      senderId: this.user_id, 
      chat_id: this.selectedChat$?.login || "", 
      sentDate: new Date()
    };
  
    if (this.selectedChat$) {
      if (this.messageControl.valid && this.messageControl.value !== null && this.messageControl.value !== ''){
        message.text = this.messageControl.value;
        this.chatService.sendMessage(this.user_id, this.selectedChat$?.login, message.text);
        this.messageControl.reset();
        this.scrollToBottom();
      }

    } else {
      console.error("Чат не выбран.");
      return;
    }       
  }
}
