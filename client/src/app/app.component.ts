import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Импорт RouterOutlet для маршрутизации
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [HomeComponent],
})
export class AppComponent {
  title = 'client'; 
}
