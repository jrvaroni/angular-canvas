import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';


@Injectable({
  providedIn: 'root',
})
export class BaseService {
  private apiUrl: string = environment.baseUrl;

  constructor(protected http: HttpClient, protected _tokenStorageService: TokenStorageService) {}

  private getHeaders(customHeaders?: HttpHeaders): HttpHeaders {
    const token = this._tokenStorageService.getToken() || ''; // Obtenha o token do armazenamento local

    let headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Adiciona o header de autorização
    });

    if (customHeaders) {
        customHeaders.keys().forEach((key) => {
          headers = headers.append(key, customHeaders.get(key) as string);
        });
      }

    return headers;
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro HTTP:', error);
    return throwError(() => new Error(error.message || 'Erro desconhecido.'));
  }

  protected get<T>(endpoint: string, params?: HttpParams, customHeaders?: HttpHeaders): Observable<T> {
    const headers = this.getHeaders(customHeaders);
    return this.http
      .get<T>(`${this.apiUrl}/${endpoint}`, { headers, params })
      .pipe(catchError(this.handleError));
  }

  protected post<T>(endpoint: string, body: any, customHeaders?: HttpHeaders): Observable<T> {
    const headers = this.getHeaders(customHeaders);
    return this.http
      .post<T>(`${this.apiUrl}/${endpoint}`, body, { headers })
      .pipe(catchError(this.handleError));
  }

  protected put<T>(endpoint: string, body: any, customHeaders?: HttpHeaders): Observable<T> {
    const headers = this.getHeaders(customHeaders);
    return this.http
      .put<T>(`${this.apiUrl}/${endpoint}`, body, { headers })
      .pipe(catchError(this.handleError));
  }

  protected delete<T>(endpoint: string, customHeaders?: HttpHeaders): Observable<T> {
    const headers = this.getHeaders(customHeaders);
    return this.http
      .delete<T>(`${this.apiUrl}/${endpoint}`, { headers })
      .pipe(catchError(this.handleError));
  }
}
