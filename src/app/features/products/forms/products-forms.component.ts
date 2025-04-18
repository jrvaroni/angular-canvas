import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IProduct } from '../../../models';
import { ProductService } from '../../../services/product.service';

import { globalComponents, globalModules, globalProviders } from '../../../global-imports';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { NgxMaskDirective } from 'ngx-mask';
import { NumbersOnlyDirective } from '../../../shared/directives/numbers-only.directive';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-products-forms',
  standalone: true,
  imports: [
    globalModules,
    globalComponents,
    ReactiveFormsModule,

    HlmButtonDirective,
		HlmLabelDirective,
		HlmInputDirective,

    NgxMaskDirective,
    NumbersOnlyDirective
  ],
  providers: [globalProviders],
  templateUrl: './products-forms.component.html',
  styleUrl: './products-forms.component.scss'
})
export class ProductsFormsComponent {

  id!: number;
  initialFormState!: IProduct;

  private _formBuilder = inject(FormBuilder);
  private _productService = inject(ProductService);
  private _toastService = inject(ToastService);
  private _navigate = inject(Router);
  private params = inject(ActivatedRoute).params.subscribe((params) => {
    const id = params['id'];
    if(id) {
      this._productService.getProductById(id).subscribe({
        next: (res) => {
          this.form.patchValue(res);
          this.initialFormState = this.form.value as IProduct;
        }
      });
    }
    this.id = id;
  });
  
  form = this._formBuilder.group({
    id: [null as number | null],
    cod: ['', [Validators.required]],
    name: ['', [Validators.required]],
    price: [null as number | null, [Validators.required]],
    qtd: [null as number | null, [Validators.required]],
    qtdMin: [null as number | null, [Validators.required]],
    userId: [null as number | null]
  });

  ngOnInit() {
    if(this.id) {
      
    }
  }

  handlerRegister() {
    const form = this.form.value as IProduct;
    this._productService.createProduct(form).subscribe({
      next: () => {
        this._toastService.show('sucesso', 'Cadastro Realizado com sucesso!');
        this.navigate();
      },
      error: () => {
				this._toastService.show('Erro', 'Houve um erro ao tentar cadastrar.', 'error')
			}
    })
  }

  handlerUpdate() {
    const form = this.form.value as IProduct;
    this._productService.updateProduct(this.id, form).subscribe({
      next: () => {
        this._toastService.show('sucesso', 'Atualização Realizada com sucesso!');
        this.navigate();
      },
      error: () => {
				this._toastService.show('Erro', 'Houve um erro ao tentar atualizar.', 'error')
			}
    })
  }


  get formHasChanged(): boolean {
    const form = this.form.getRawValue() as IProduct
    return JSON.stringify(form) !== JSON.stringify(this.initialFormState);
  }

  navigate() {
    setTimeout(() => this._navigate.navigate(['produtos']), 1000);
  }

}