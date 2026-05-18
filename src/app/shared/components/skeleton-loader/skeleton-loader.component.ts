import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonLoaderComponent {
  @Input() show = false;
  @Input() rows = 5;
  @Input() type: 'table' | 'form' = 'table';

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, index) => index);
  }
}
