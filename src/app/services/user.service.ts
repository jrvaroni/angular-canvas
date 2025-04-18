import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { ILogin, IUser } from '../models/user';
import { BaseService } from './base.service';

@Injectable({
	providedIn: 'root'
})
export class UserService extends BaseService {

	login(User: ILogin): Observable<ILogin> {
		return this.post(`login`, User);
	}
	
	getUsers(): Observable<IUser[]> {
		return this.get('users');
	}

	getUserById(id: number): Observable<IUser[]> {
		return this.get(`users/${id}`);
	}


	// // salva um Userro
	// saveUser(User: IUser): Observable<IUser> {
	// 	return this.httpClient.post<IUser>(this.url, JSON.stringify(User), this.httpOptions)
	// 		.pipe(
	// 			retry(2),
	// 			catchError(this.handleError)
	// 		)
	// }

	// // utualiza um Userro
	// updateUser(User: IUser): Observable<IUser> {
	// 	return this.httpClient.put<IUser>(this.url + '/' + User.account_id, JSON.stringify(User), this.httpOptions)
	// 		.pipe(
	// 			retry(1),
	// 			catchError(this.handleError)
	// 		)
	// }

	// // deleta um Userro
	// deleteUser(User: IUser) {
	// 	return this.httpClient.delete<IUser>(this.url + '/' + User.account_id, this.httpOptions)
	// 		.pipe(
	// 			retry(1),
	// 			catchError(this.handleError)
	// 		)
	// }
}
