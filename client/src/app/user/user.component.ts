import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user.service'
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomeComponent } from '../home/home.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule, HomeComponent],
  providers: [UserService],
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  registerForm: FormGroup;
  loginForm: FormGroup;
  registerDisplay: boolean = true;
  loginDisplay: boolean = false; 
  user_login: string = '';
  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.registerForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required]],
      surename: ['', [Validators.required]],
      birthday: ['', [Validators.required]],
    });

    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

    // this.getUsers();

  // getUsers(): void {
  //   this.userService.getAllUsers().subscribe({
  //     next: (data) => {
  //       this.users = data;
  //     },
  //     error: (error) => {
  //       console.error('Ошибка при загрузке пользователей:', error);
  //     },
  //   });
  //   console.log(this.userService.getAllUsers())
  // }

  registerUser(): void {
    if (this.registerForm.valid) {
      this.userService.register(this.registerForm.value).subscribe({
        next: (user: User) => {
          console.log('User registered successfully:', user);
        },
        error: (error: any) => {
          console.error('Error registering user:', error);
        },
      });;
    }
    else{
      console.log("NotValid");
    }
  }

  loginUser(): void{
    if (this.loginForm.valid) {
      this.userService.login(this.loginForm.value.login, this.loginForm.value.password).subscribe({
        next: (response: any) => {
          if (response.status_code == 200){
            this.user_login= response.user.login;
            console.log(this.user_login);
            this.router.navigate([`messager/${this.loginForm.value.login}`]);
          }
        },
        error: (error: any) => {
          console.error('Error registering user:', error);
        },
      });;
    }
    else{
      console.log("NotValid");
    }
  }

  showRegistr(): void{
    if (!this.registerDisplay){
      this.loginDisplay = false;
      this.registerDisplay = true;
    }     
  }
  showLogin(): void{
    if (!this.loginDisplay){
      this.loginDisplay = true;
      this.registerDisplay = false;
    }     
  }
}