import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user.service'
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  providers: [UserService],
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  registerForm: FormGroup;
  loginForm: FormGroup;

  message: string = '';

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.registerForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required]],
      surename: ['', [Validators.required]],
      birthday: ['', [Validators.required]],
    });

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      },
    });
  }
  

  // // Получение списка пользователей
  // getUsers(): void {
  //   this.http.get<any[]>('/api/users').subscribe(
  //     (data) => {
  //       this.users = data;
  //     },
  //     (error) => {
  //       console.error('Ошибка при получении пользователей:', error);
  //     }
  //   );
  // }

  // Регистрация нового пользователя
  registerUser(): void {
    if (this.registerForm.valid) {
      console.log("Register");
      this.userService.register(this.registerForm.value);
    }
    else{
      console.log("NotValid");
    }
    this.getUsers();
  }

  // // Вход пользователя
  // loginUser(): void {
  //   if (this.loginForm.valid) {
  //     this.http.post('/api/users/login', this.loginForm.value).subscribe(
  //       (response: any) => {
  //         this.message = `Добро пожаловать, ${response.user.name}`;
  //       },
  //       (error) => {
  //         console.error('Ошибка входа:', error);
  //         this.message = 'Ошибка входа: неверный логин или пароль';
  //       }
  //     );
  //   }
  // }
}