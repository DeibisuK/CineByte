import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselEstrenosComponent } from './carousel-estrenos.component';

describe('CarouselEstrenosComponent', () => {
  let component: CarouselEstrenosComponent;
  let fixture: ComponentFixture<CarouselEstrenosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselEstrenosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselEstrenosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
