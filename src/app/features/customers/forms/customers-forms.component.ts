import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ICustomer, IProduct } from '../../../models';

import { globalComponents, globalModules, globalProviders } from '../../../global-imports';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { NgxMaskDirective } from 'ngx-mask';
import { NumbersOnlyDirective } from '../../../shared/directives/numbers-only.directive';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CpfCnpjValidator, NameValidator } from '../../../validations';
import { CustomerService } from '../../../services/customer.service';

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
  templateUrl: './customers-forms.component.html',
  styleUrl: './customers-forms.component.scss'
})
export class CustomersFormsComponent {

  id!: number;
  initialFormState!: IProduct;

  private _formBuilder = inject(FormBuilder);
  private _customerService = inject(CustomerService);
  private _toastService = inject(ToastService);
  private _navigate = inject(Router);
  private params = inject(ActivatedRoute).params.subscribe((params) => {
    const id = params['id'];
    if(id) {
      this._customerService.getCustomerById(id).subscribe({
        next: (res) => {
          this.form.patchValue(res);
          this.initialFormState = this.form.value as IProduct;
        }
      });
    }
    this.id = id;
  });
  
  form = this._formBuilder.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    tel: [''],
    tel2: [''],
    document: [''],
    address: [''],
    anotation: [''],
  },
  {
    validators: [CpfCnpjValidator('document'), NameValidator('name')]
  });

  ngOnInit() {
    if(this.id) {
      
    }
  }

  handlerRegister() {
    const form = this.form.value as ICustomer;
    this._customerService.createCustomer(form).subscribe({
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
    const form = this.form.value as ICustomer;
    this._customerService.updateCustomer(this.id, form).subscribe({
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
    const form = this.form.getRawValue() as ICustomer
    return JSON.stringify(form) !== JSON.stringify(this.initialFormState);
  }

  navigate() {
    setTimeout(() => this._navigate.navigate(['clientes']), 1000);
  }

}