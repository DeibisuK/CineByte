import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFuncionesComponent } from './editar-funciones.component';

describe('EditarFuncionesComponent', () => {
  let component: EditarFuncionesComponent;
  let fixture: ComponentFixture<EditarFuncionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarFuncionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarFuncionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
