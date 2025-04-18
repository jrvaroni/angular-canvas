
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertIconDirective,
  HlmAlertTitleDirective,
} from '@spartan-ng/ui-alert-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { globalProviders } from '../../../global-imports';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastService } from '../../../services/toast.service';
import { IToast } from '../../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shared-toast',
  standalone: true,
  imports: [
    HlmAlertDirective,
    HlmAlertDescriptionDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,
    HlmIconComponent,
  ],
  providers: [globalProviders],
  templateUrl: './toast.component.html',
  animations: [
    trigger('toastAnimation', [
        transition(':enter', [
            style({ transform: 'translateY(100%)', opacity: 0}),
            animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1}))
        ]),
        transition(':leave', [
            style({ transform: 'translateY(100%)', opacity: 0}),
            animate('500ms ease-in', style({ transform: 'translateY(100%)', opacity: 0}))
        ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {

    private _toastService = inject(ToastService);
    private subscription: Subscription = Subscription.EMPTY;
    toasts: IToast[] = [];

    ngOnInit(): void {
      this.subscription = this._toastService.toasts$.subscribe(toasts => this.toasts = toasts)
    }

    ngOnDestroy(): void {
      if(this.subscription) {
        this.subscription.unsubscribe();
      }
    }

    removeToast(id: number) {
      this._toastService.remove(id);
    }

}
