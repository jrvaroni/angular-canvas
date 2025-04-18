import { Component, inject } from '@angular/core';
import { IProduct } from '../../../models';
import { ProductService } from '../../../services/product.service';

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

@Component({
  selector: 'app-products-list',
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
  ],
  providers: [globalProviders],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss'
})
export class ProductsListComponent {

  private _navigate = inject(Router);
  private _productService = inject(ProductService);
  private _toastService = inject(ToastService);
  products: IProduct[] = [];
  prices: number = 0;

  currentSelectedProduct:IProduct | null = null;

  ngOnInit() {
    this.getProducts();
  }

	getProducts(): void {
		this._productService.getProducts().subscribe({
			next: (response) => {
				this.products = response;
        this.prices = this.sumPrices;
			}
		})
	}

  goTo(product: IProduct) {
    this._navigate.navigate([`produtos/${product!.id}`])
  }

  handlerDelete(ctx: any) {
    const id = Number(this.currentSelectedProduct!.id)
    const name = String(this.currentSelectedProduct!.name)
    this._productService.deleteProduct(id).subscribe({
      next: () => {
        this._toastService.show(name, 'Deletado com sucesso!');
        this.getProducts();
        ctx.close();
      }
    })
  }

  get sumPrices() {
    return this.products.reduce((sum, item) => sum + Number(item.price), 0);
  }

}