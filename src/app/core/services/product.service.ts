import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, ApiResponse, ProductUpdateRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = '/bp/products';
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verification/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product).pipe(
      map(response => response.data)
    );
  }

  updateProduct(id: string, product: ProductUpdateRequest): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product).pipe(
      map(response => response.data)
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
