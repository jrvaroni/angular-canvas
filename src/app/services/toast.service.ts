import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IToast } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    
    private toasts: IToast[] = [];
    private toastSubject = new BehaviorSubject<IToast[]>([]);
    toasts$ = this.toastSubject.asObservable();

    show(title: string, message: string, variant: 'success' | 'error' = 'success', icon: string | null = null, timeout: number = 3000) {
        const id = Date.now();
        const toast: IToast = { icon, title, message, variant: variant, id };
        this.toasts.push(toast);
        this.toastSubject.next(this.toasts);
        setTimeout(() => this.remove(id), timeout);
        return id;
    }

    remove(id: number){
        this.toasts = this.toasts.filter(t => t.id !== id)
        this.toastSubject.next(this.toasts);
    }

}