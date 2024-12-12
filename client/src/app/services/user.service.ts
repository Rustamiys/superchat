import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map} from 'rxjs/operators';

export class User {
  constructor(
    public login: string,
    public name: string,
    public surename: string,
    public birthday: string,
    public password?: string // Optional property
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class UserService{
  private apiUrl = 'http://localhost:5000/api/users'; // базовый URL API

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map(users => users.map(user => new User(
        user.login,
        user.name,
        user.surename,
        user.birthday,
        user.password 
      ))),
      catchError(this.handleError)
    );
  }

  register(user: User) {
    const url = `${this.apiUrl}/register`; 
    console.log(url);
    return this.http.post<User>(url, user).pipe(
      map(response => new User(
        response.login,
        response.name,
        response.surename,
        response.birthday,
        response.password 
      )),
      catchError(this.handleError)
    );
  }

  login(login: string, password: string) {
    const url = `${this.apiUrl}/login`;
    return this.http.post(url, { login, password }).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(userId: string): Observable<any> {
    const url = `${this.apiUrl}/${userId}`; 
    return this.http.delete(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
