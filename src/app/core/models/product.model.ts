export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export type ProductUpdateRequest = Omit<Product, 'id'>;

export interface ApiResponse<T> {
  message?: string;
  data: T;
}
