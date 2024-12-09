import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl} from '@angular/forms';
import { MatFormFieldModule,} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  user$ = this.usersService.currentUserProfile$;

  searchControl = new FormControl('');
  chatListControl = new FormControl();
  messageControl = new FormControl('');

  users$ = combineLatest([
    this.usersService.allUsers$,
    this.user$,
    this.searchControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([users, user, searchString]) => users.filter(u => u.displayName?.toLowerCase().includes(searchString.toLowerCase()) && u.uid !== user?.uid))
  );

  myChats$ = this.chatsService.myChats$;

  selectedChat$ = combineLatest([
    this.chatListControl.valueChanges,
    this.myChat$
  ]).pipe(map(([value, chats]) => chats.find(c => c.id === value[0])))

  messages$ = this.chatListControl.valueChanges.pipe(
    map(value => value[0]),
    switchMap(chatId => this.chatsService.getChatMessages$(chatId))
  )

  constructor(
    private usersService: UsersService,
    private chatsService: ChatsService
  ) { }

  ngOnInit(): void { }

  createChat(otherUser: ProfileUser) {
    this.chatsService.createChat(otherUser).subscribe();
  }

  sendMessage() {
    const message = this.messageControl.value;
    const selectedChatId = this.chatListControl.value[0];

    if (message && selectedChatId) {
      this.chatsService.addChatMessage(selectedChatId, message).subscribe();
      this.messageControl.setValue('');
    }
  }
}
