import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../models';
import { BaseService } from './base.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService extends BaseService {

    getProducts(): Observable<IProduct[]> {
        return this.get('products');
    }

    getProductById(id: number): Observable<IProduct> {
        return this.get(`product/${id}`);
    }

    createProduct(product: IProduct): Observable<IProduct> {
        return this.post(`product/register/`, product);
    }

    updateProduct(id: number, product: IProduct): Observable<IProduct> {
        return this.put(`product/update/${id}`, product);
    }

    deleteProduct(id: number): Observable<IProduct> {
        return this.delete(`product/delete/${id}`);
    }

}
