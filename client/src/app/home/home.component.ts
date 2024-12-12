import { Component, OnInit } from '@angular/core';
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
import { pipe , distinctUntilChanged} from 'rxjs';
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
  myChats$: User[] = [];
  users: User[] = [];
  searchControl = new FormControl('');
  messageControl = new FormControl('');
  chatListControl = new FormControl('');
  selectedChat$: User | null = null;
  chat: Message[] = [];
  THIS_BUFFER: Message[] = [];
  user_id: string = '';

  constructor(private userService: UserService, private chatService: ChatService, private route: ActivatedRoute) {         
    this.userService.getAllUsers().subscribe({
      next: (data) => {        
        this.myChats$ = data.filter(user => user.login !== this.user_id);
        console.log(this.myChats$);
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
  }  

  select(login: string): void {
    console.log(this.myChats$);    
    const selectedChat = this.myChats$.find((user) => user.login === login) || null;
    this.selectedChat$ = selectedChat;
    if (this.selectedChat$){
      this.chatService.connect(this.user_id, this.selectedChat$?.login);
      this.chatService.getMessagesAll(this.user_id, this.selectedChat$?.login).subscribe({
        next: (data) => {
          this.chat = data;
          console.log(data);
        },
        error: (error) => {
          console.error('Ошибка при загрузке сообщений:', error);
        }
      });
    }
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
      }

    } else {
      console.error("Чат не выбран.");
      return;
    }
  
    this.chatService.getMessage().pipe(distinctUntilChanged()).subscribe({
      next: (data) => {
        this.chat.push(data);
        console.log(this.chat);
      },
      error: (error) => {
        console.error('Ошибка при загрузке сообщений:', error);
      },
    })
    // this.chat.push(this.THIS_BUFFER.at(-1));

    ;
  }
}
