import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet],
})
export class AppComponent {
  title = 'client'; 
}
