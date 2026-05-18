import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, SkeletonLoaderComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  
  searchTerm = '';
  pageSize = 5;
  currentPage = 1;
  
  isLoading = true;
  errorMessage = '';
  
  activeMenuId: string | null = null;
  showDeleteModal = false;
  productToDelete: Product | null = null;

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los productos.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      this.filteredProducts = this.products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term)
      );
    } else {
      this.filteredProducts = [...this.products];
    }
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedProducts = this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
    this.activeMenuId = null;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  toggleMenu(productId: string, event: Event): void {
    event.stopPropagation();
    if (this.activeMenuId === productId) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = productId;
    }
  }

  closeMenu(): void {
    this.activeMenuId = null;
  }

  navigateToAdd(): void {
    this.router.navigate(['/products/add']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/products/edit', id]);
  }

  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
    this.activeMenuId = null;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  confirmDelete(): void {
    if (this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete.id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.loadProducts();
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'No se pudo eliminar el producto.';
          this.showDeleteModal = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
