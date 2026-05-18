import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

interface ApiValidationError {
  property: string;
  constraints?: Record<string, string>;
}

interface ApiErrorResponse {
  errors?: ApiValidationError[];
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SkeletonLoaderComponent],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  productForm!: FormGroup;
  isEditMode = false;
  productIdToEdit: string | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.productIdToEdit = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productIdToEdit;
    
    this.initForm();

    if (this.isEditMode && this.productIdToEdit) {
      this.loadProductData(this.productIdToEdit);
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [
        { value: '', disabled: this.isEditMode },
        [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        this.isEditMode ? null : [this.validateProductId.bind(this)]
      ],
      name: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, this.validateReleaseDate]],
      date_revision: [{ value: '', disabled: true }, Validators.required]
    });

    this.productForm.get('date_release')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        this.productForm.get('date_revision')?.setValue(this.calculateRevisionDate(value));
      });
  }

  loadProductData(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts().subscribe({
      next: (products) => {
        const product = products.find(p => p.id === id);
        if (product) {
          this.productForm.patchValue({
            id: product.id,
            name: product.name,
            description: product.description,
            logo: product.logo,
            date_release: this.formatToDateInput(product.date_release)
          });
        } else {
          this.router.navigate(['/products']);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el producto.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  validateProductId(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }
    return timer(300).pipe(
      switchMap(() => this.productService.verifyProductId(control.value)),
      map(exists => (exists ? { idExists: true } : null)),
      catchError(() => of(null))
    );
  }

  validateReleaseDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    inputDate.setMinutes(inputDate.getMinutes() + inputDate.getTimezoneOffset());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { invalidDate: true };
    }
    return null;
  }

  isInvalid(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    this.productForm.markAllAsTouched();
    this.errorMessage = '';
    
    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.getRawValue() as Product;
    this.isLoading = true;

    if (this.isEditMode && this.productIdToEdit) {
      const { id: _id, ...productToUpdate } = formValue;

      this.productService.updateProduct(this.productIdToEdit, productToUpdate).subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.router.navigate(['/products']);
        },
        error: (error: unknown) => this.handleSubmitError(error, 'No se pudo actualizar el producto.')
      });
    } else {
      this.productService.createProduct(formValue).subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.router.navigate(['/products']);
        },
        error: (error: unknown) => this.handleSubmitError(error, 'No se pudo registrar el producto.')
      });
    }
  }

  onReset(): void {
    if (this.isEditMode && this.productIdToEdit) {
      this.loadProductData(this.productIdToEdit);
    } else {
      this.productForm.reset();
    }
  }

  private calculateRevisionDate(value: string | null): string {
    if (!value) {
      return '';
    }

    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
      return '';
    }

    const revisionDate = new Date(year + 1, month - 1, day);
    const revisionMonth = String(revisionDate.getMonth() + 1).padStart(2, '0');
    const revisionDay = String(revisionDate.getDate()).padStart(2, '0');

    return `${revisionDate.getFullYear()}-${revisionMonth}-${revisionDay}`;
  }

  private formatToDateInput(value: string): string {
    return value ? value.split('T')[0] : '';
  }

  private handleSubmitError(error: unknown, message: string): void {
    this.applyApiValidationErrors(error);
    this.errorMessage = message;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private applyApiValidationErrors(error: unknown): void {
    const validationErrors = this.getApiValidationErrors(error);

    validationErrors.forEach(validationError => {
      const control = this.productForm.get(validationError.property);
      const constraintMessage = Object.values(validationError.constraints ?? {})[0];

      if (!control || !constraintMessage) {
        return;
      }

      control.setErrors({
        ...control.errors,
        api: this.getApiFieldMessage(validationError.property, constraintMessage)
      });
      control.markAsTouched();
    });
  }

  private getApiValidationErrors(error: unknown): ApiValidationError[] {
    if (!(error instanceof HttpErrorResponse)) {
      return [];
    }

    const response = error.error as ApiErrorResponse | null;
    return response?.errors ?? [];
  }

  private getApiFieldMessage(property: string, message: string): string {
    const labels: Record<string, string> = {
      id: 'ID',
      name: 'Nombre',
      description: 'Descripción',
      logo: 'Logo',
      date_release: 'Fecha de liberación',
      date_revision: 'Fecha de revisión'
    };
    const minLength = message.match(/longer than or equal to (\d+) characters/);

    if (minLength) {
      return `${labels[property] ?? property} debe tener mínimo ${minLength[1]} caracteres.`;
    }

    return `No se pudo registrar ${labels[property]?.toLowerCase() ?? property}.`;
  }
}
