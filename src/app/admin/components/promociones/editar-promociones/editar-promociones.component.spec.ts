import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPromocionesComponent } from './editar-promociones.component';

describe('EditarPromocionesComponent', () => {
  let component: EditarPromocionesComponent;
  let fixture: ComponentFixture<EditarPromocionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPromocionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPromocionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
