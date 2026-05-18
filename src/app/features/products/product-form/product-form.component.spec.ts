import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../core/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { Product, ProductUpdateRequest } from '../../../core/models/product.model';
import { HttpErrorResponse } from '@angular/common/http';

type ProductFormServiceMock = {
  getProducts: jest.MockedFunction<() => Observable<Product[]>>;
  verifyProductId: jest.MockedFunction<(id: string) => Observable<boolean>>;
  createProduct: jest.MockedFunction<(product: Product) => Observable<Product>>;
  updateProduct: jest.MockedFunction<(id: string, product: ProductUpdateRequest) => Observable<Product>>;
};

type RouterMock = {
  navigate: jest.MockedFunction<(commands: string[]) => Promise<boolean>>;
};

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceSpy: ProductFormServiceMock;
  let routerSpy: RouterMock;

  const mockProduct = {
    id: 'uno',
    name: 'Tarjeta Credito',
    description: 'Descripcion valida',
    logo: 'logo.jpg',
    date_release: '2025-01-01',
    date_revision: '2026-01-01'
  };

  beforeEach(async () => {
    productServiceSpy = {
      getProducts: jest.fn<Observable<Product[]>, []>(),
      verifyProductId: jest.fn<Observable<boolean>, [string]>(),
      createProduct: jest.fn<Observable<Product>, [Product]>(),
      updateProduct: jest.fn<Observable<Product>, [string, ProductUpdateRequest]>()
    };
    routerSpy = { navigate: jest.fn<Promise<boolean>, [string[]]>() };
    const routeMock = {
      snapshot: {
        paramMap: {
          get: (_key: string) => null
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize empty form in add mode', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.productForm.get('id')?.value).toBe('');
    expect(component.productForm.get('id')?.disabled).toBe(false);
  });

  it('should validate invalid form state', () => {
    component.productForm.patchValue({
      id: 'a',
      name: '',
      description: 'short',
      logo: '',
      date_release: '2020-01-01',
    });
    
    expect(component.productForm.valid).toBe(false);
    expect(component.productForm.get('id')?.errors?.['minlength']).toBeTruthy();
    expect(component.productForm.get('name')?.errors?.['required']).toBeTruthy();
    expect(component.productForm.get('date_release')?.errors?.['invalidDate']).toBeTruthy();
  });

  it('should validate valid form state and set date_revision correctly', () => {
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 1); // tomorrow
    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, '0');
    const day = String(validDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const expectedRevYear = year + 1;
    const expectedRevDateStr = `${expectedRevYear}-${month}-${day}`;

    component.productForm.patchValue({
      id: 'validId',
      name: 'Valid Name',
      description: 'Valid description',
      logo: 'logo.png',
      date_release: dateStr
    });

    expect(component.productForm.get('date_revision')?.value).toBe(expectedRevDateStr);
  });

  it('should async validate if ID exists', async () => {
    productServiceSpy.verifyProductId.mockReturnValue(of(true));
    
    const idControl = component.productForm.get('id');
    idControl?.setValue('existing');
    idControl?.markAsTouched();
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    expect(idControl?.errors?.['idExists']).toBe(true);
  });

  it('should submit valid form and call createProduct', () => {
    component.productForm.patchValue({
      id: 'validId',
      name: 'Valid Name',
      description: 'Valid description',
      logo: 'logo.png',
      date_release: '2050-01-01'
    });
    
    productServiceSpy.createProduct.mockReturnValue(of(mockProduct));
    
    component.onSubmit();
    
    expect(productServiceSpy.createProduct).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should show backend validation errors in the related field', () => {
    const backendError = new HttpErrorResponse({
      status: 400,
      error: {
        errors: [
          {
            property: 'name',
            constraints: {
              minLength: 'name must be longer than or equal to 6 characters'
            }
          }
        ]
      }
    });

    component.productForm.patchValue({
      id: 'validId',
      name: 'Valid Name',
      description: 'Valid description',
      logo: 'logo.png',
      date_release: '2050-01-01'
    });
    productServiceSpy.createProduct.mockReturnValue(throwError(() => backendError));

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('No se pudo registrar el producto.');
    expect(component.productForm.get('name')?.errors?.['api']).toBe('Nombre debe tener mínimo 6 caracteres.');
  });
});
