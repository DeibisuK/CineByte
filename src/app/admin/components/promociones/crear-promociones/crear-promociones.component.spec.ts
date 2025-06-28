import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPromocionesComponent } from './crear-promociones.component';

describe('CrearPromocionesComponent', () => {
  let component: CrearPromocionesComponent;
  let fixture: ComponentFixture<CrearPromocionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPromocionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPromocionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
