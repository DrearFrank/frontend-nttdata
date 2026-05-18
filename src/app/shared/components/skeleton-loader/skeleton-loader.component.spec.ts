import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  let component: SkeletonLoaderComponent;
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonLoaderComponent);
    component = fixture.componentInstance;
  });

  it('renders table placeholder rows when visible', () => {
    component.show = true;
    component.rows = 2;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.skeleton-row').length).toBe(2);
  });

  it('does not render placeholders when hidden', () => {
    component.show = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.skeleton-container')).toBeNull();
  });
});
