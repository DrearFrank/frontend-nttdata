import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../core/services/product.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';

type ProductListServiceMock = {
  getProducts: jest.MockedFunction<() => Observable<Product[]>>;
  deleteProduct: jest.MockedFunction<(id: string) => Observable<void>>;
};

type RouterMock = {
  navigate: jest.MockedFunction<(commands: string[]) => Promise<boolean>>;
};

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceSpy: ProductListServiceMock;
  let routerSpy: RouterMock;

  const mockProducts = [
    {
      id: 'uno',
      name: 'Tarjeta Credito',
      description: 'Desc 1',
      logo: 'logo.jpg',
      date_release: '2025-01-01',
      date_revision: '2026-01-01'
    },
    {
      id: 'dos',
      name: 'Cuenta Ahorro',
      description: 'Desc 2',
      logo: 'logo2.jpg',
      date_release: '2025-02-01',
      date_revision: '2026-02-01'
    }
  ];

  beforeEach(async () => {
    productServiceSpy = {
      getProducts: jest.fn<Observable<Product[]>, []>(),
      deleteProduct: jest.fn<Observable<void>, [string]>()
    };
    routerSpy = { navigate: jest.fn<Promise<boolean>, [string[]]>() };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    productServiceSpy.getProducts.mockReturnValue(of(mockProducts));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load products on init', () => {
    expect(productServiceSpy.getProducts).toHaveBeenCalled();
    expect(component.products.length).toBe(2);
    expect(component.displayedProducts.length).toBe(2);
    expect(component.isLoading).toBe(false);
  });

  it('should filter products correctly', () => {
    component.searchTerm = 'Credito';
    component.onSearchChange();
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].id).toBe('uno');
  });

  it('should change page size', () => {
    component.pageSize = 1;
    component.applyFilters();
    expect(component.displayedProducts.length).toBe(1);
  });

  it('should open delete modal', () => {
    component.openDeleteModal(mockProducts[0]);
    expect(component.productToDelete).toEqual(mockProducts[0]);
    expect(component.showDeleteModal).toBe(true);
    expect(component.activeMenuId).toBeNull();
  });

  it('should confirm delete and reload products', () => {
    productServiceSpy.deleteProduct.mockReturnValue(of(undefined));
    component.productToDelete = mockProducts[0];
    
    component.confirmDelete();
    
    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith('uno');
    expect(component.showDeleteModal).toBe(false);
    // It should reload products (getProducts called twice now)
    expect(productServiceSpy.getProducts).toHaveBeenCalledTimes(2);
  });

  it('should navigate to add page', () => {
    component.navigateToAdd();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products/add']);
  });

  it('should navigate to edit page', () => {
    component.navigateToEdit('uno');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products/edit', 'uno']);
  });
});
