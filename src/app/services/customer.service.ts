import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICustomer } from '../models';
import { BaseService } from './base.service';

@Injectable({
    providedIn: 'root'
})
export class CustomerService extends BaseService {

    getCustomers(): Observable<ICustomer[]> {
        return this.get('customers');
    }

    getCustomerById(id: number): Observable<ICustomer> {
        return this.get(`customer/${id}`);
    }

    createCustomer(customer: ICustomer): Observable<ICustomer> {
        return this.post(`customer/register/`, customer);
    }

    updateCustomer(id: number, customer: ICustomer): Observable<ICustomer> {
        return this.put(`customer/update/${id}`, customer);
    }

    deleteCustomer(id: number): Observable<ICustomer> {
        return this.delete(`customer/delete/${id}`);
    }

}
