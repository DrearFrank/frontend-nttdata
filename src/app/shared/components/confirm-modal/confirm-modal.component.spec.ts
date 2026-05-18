import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
  });

  it('emits confirm when the confirm button is clicked', () => {
    const confirmSpy = jest.spyOn(component.confirm, 'emit');

    component.isOpen = true;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.btn-primary').click();

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('emits cancel when the cancel button is clicked', () => {
    const cancelSpy = jest.spyOn(component.cancel, 'emit');

    component.isOpen = true;
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.btn-secondary').click();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
