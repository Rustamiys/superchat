import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl} from '@angular/forms';
import { MatFormFieldModule,} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, MatDividerModule, MatFormFieldModule, MatListModule,
    MatInputModule, MatAutocompleteModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  
  searchControl = new FormControl('');
  messageControl = new FormControl('');
  chatListControl = new FormControl('');
  sendMessage(): void {
    console.log('Message sent!');
    // Добавьте здесь логику отправки сообщения
  }
}
