import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarFuncionesComponent } from './listar-funciones.component';

describe('ListarFuncionesComponent', () => {
  let component: ListarFuncionesComponent;
  let fixture: ComponentFixture<ListarFuncionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarFuncionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarFuncionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
