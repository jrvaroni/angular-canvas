import { Injectable } from '@angular/core';
import { IUser } from '../models/user';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
	providedIn: 'root'
})
export class TokenStorageService {

	private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  	isLoggedIn$ = this.isLoggedInSubject.asObservable();

	constructor() { 
		this.isLoggedInSubject.next(this.getUser())
	}

	signOut(): void {
		window.sessionStorage.clear();
		this.isLoggedInSubject.next(false);
	}

	public saveToken(token: string): void {
		window.sessionStorage.removeItem(TOKEN_KEY);
		window.sessionStorage.setItem(TOKEN_KEY, token);
		this.isLoggedInSubject.next(true);
	}

	public getToken(): string {
		return sessionStorage.getItem(TOKEN_KEY) as string;
	}

	public saveUser(user: IUser): void {
		window.sessionStorage.removeItem(USER_KEY);
		window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
	}

	public getUser(): any {
		return JSON.parse(window.sessionStorage.getItem(USER_KEY) as string);
	}

	get isLoggedIn(): boolean {
		return this.isLoggedInSubject.value;
	}
}
