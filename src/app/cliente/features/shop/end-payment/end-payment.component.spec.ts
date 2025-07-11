import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndPaymentComponent } from './end-payment.component';

describe('EndPaymentComponent', () => {
  let component: EndPaymentComponent;
  let fixture: ComponentFixture<EndPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
