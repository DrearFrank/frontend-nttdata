import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Product, ProductUpdateRequest } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo',
    logo: 'logo.jpg',
    date_release: '2025-01-01',
    date_revision: '2026-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductService
      ]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products', () => {
    service.getProducts().subscribe(products => {
      expect(products.length).toBe(1);
      expect(products[0]).toEqual(mockProduct);
    });

    const req = httpMock.expectOne('/bp/products');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [mockProduct] });
  });

  it('should verify product id existence', () => {
    service.verifyProductId('trj-crd').subscribe(exists => {
      expect(exists).toBe(true);
    });

    const req = httpMock.expectOne('/bp/products/verification/trj-crd');
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('should create a product', () => {
    service.createProduct(mockProduct).subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne('/bp/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProduct);
    req.flush({ data: mockProduct });
  });

  it('should update a product', () => {
    const updateRequest: ProductUpdateRequest = {
      name: mockProduct.name,
      description: mockProduct.description,
      logo: mockProduct.logo,
      date_release: mockProduct.date_release,
      date_revision: mockProduct.date_revision
    };

    service.updateProduct('trj-crd', updateRequest).subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne('/bp/products/trj-crd');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateRequest);
    req.flush({ data: mockProduct });
  });

  it('should delete a product', () => {
    service.deleteProduct('trj-crd').subscribe();

    const req = httpMock.expectOne('/bp/products/trj-crd');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
