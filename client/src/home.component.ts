import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from '';
import { UsersService } from 'src/app/services/users.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
    user$ = this.usersService.currentUserProfile$;

    searchControl = new FormControl('');

    users$ = combineLatest([
        this.usersService.allUsers$,
        this.user$,
        this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
        map(([users, user, searchString]) =>  users.filter(u => u.displayName?.toLowerCase().includes(searchString.toLowerCase()) && u.uid !== user?.uid))
    );

    constructor(private usersService: UsersService, private chatsService: ChatsService) { }

    ngOnInit(): void { }

    createChat(otherUser: ProfileUser) {
        this.chatsService.createChat(otherUser).subscribe();
    }
}