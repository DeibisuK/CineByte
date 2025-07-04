import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearFuncionesComponent } from './crear-funciones.component';

describe('CrearFuncionesComponent', () => {
  let component: CrearFuncionesComponent;
  let fixture: ComponentFixture<CrearFuncionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearFuncionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearFuncionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
