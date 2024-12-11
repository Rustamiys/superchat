import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface User {
  id: string;
  login: string;
  password?: string; // Пароль может быть необязательным в некоторых ответах
  name: string;
  username: string;
  birthday: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService{
  private apiUrl = 'http://127.0.0.1:5000/api/users'; // базовый URL API

  constructor(private http: HttpClient) {}

  register(user: User): Observable<any> {
    const url = `${this.apiUrl}/register`;
    return this.http.post(url, user).pipe(catchError(this.handleError));
  }

  login(login: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/login`;
    return this.http.post(url, { login, password }).pipe(catchError(this.handleError));
  }

  getAllUsers(): Observable<User[]> {
    const url = `${this.apiUrl}`;
    return this.http.get<User[]>(url).pipe(catchError(this.handleError));
  }

  deleteUser(userId: string): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.delete(url).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.detail || error.message || 'Ошибка сервера';
    return throwError(() => new Error(message));
  }
}