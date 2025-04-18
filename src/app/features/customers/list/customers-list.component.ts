import { Component, inject } from '@angular/core';
import { ICustomer, IProduct } from '../../../models';

import { globalComponents, globalModules, globalProviders } from '../../../global-imports';
import { Router } from '@angular/router';

import {
  BrnAlertDialogContentDirective,
  BrnAlertDialogTriggerDirective,
} from '@spartan-ng/brain/alert-dialog';

import {
  HlmAlertDialogActionButtonDirective,
  HlmAlertDialogCancelButtonDirective,
  HlmAlertDialogContentComponent,
  HlmAlertDialogDescriptionDirective,
  HlmAlertDialogFooterComponent,
  HlmAlertDialogHeaderComponent,
  HlmAlertDialogOverlayDirective,
  HlmAlertDialogTitleDirective,
} from '@spartan-ng/ui-alertdialog-helm';
import { ToastService } from '../../../services/toast.service';
import { CustomerService } from '../../../services/customer.service';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    globalModules,
    globalComponents,

    BrnAlertDialogTriggerDirective,
    BrnAlertDialogContentDirective,
    
    HlmAlertDialogOverlayDirective,
    HlmAlertDialogHeaderComponent,
    HlmAlertDialogFooterComponent,
    HlmAlertDialogTitleDirective,
    HlmAlertDialogDescriptionDirective,
    HlmAlertDialogCancelButtonDirective,
    HlmAlertDialogActionButtonDirective,
    HlmAlertDialogContentComponent,
    NgxMaskPipe
  ],
  providers: [globalProviders],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent {

  private _navigate = inject(Router);
  private _customerService = inject(CustomerService);
  private _toastService = inject(ToastService);
  customers: ICustomer[] = [];
  prices: number = 0;

  currentSelectedcustomer:ICustomer | null = null;

  ngOnInit() {
    this.getCustomers();
  }

	getCustomers(): void {
		this._customerService.getCustomers().subscribe({
			next: (response) => {
				this.customers = response;
			}
		})
	}

  goTo(customer: ICustomer) {
    this._navigate.navigate([`clientes/${customer!.id}`])
  }

  handlerDelete(ctx: any) {
    const id = Number(this.currentSelectedcustomer!.id)
    const name = String(this.currentSelectedcustomer!.name)
    this._customerService.deleteCustomer(id).subscribe({
      next: () => {
        this._toastService.show(name, 'Deletado com sucesso!');
        this.getCustomers();
        ctx.close();
      }
    })
  }

}