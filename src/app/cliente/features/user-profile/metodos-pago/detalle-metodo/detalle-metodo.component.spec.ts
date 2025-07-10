import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleMetodoComponent } from './detalle-metodo.component';

describe('DetalleMetodoComponent', () => {
  let component: DetalleMetodoComponent;
  let fixture: ComponentFixture<DetalleMetodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMetodoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleMetodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
