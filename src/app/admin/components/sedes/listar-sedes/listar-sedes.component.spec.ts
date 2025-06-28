import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarSedesComponent } from './listar-sedes.component';

describe('ListarSedesComponent', () => {
  let component: ListarSedesComponent;
  let fixture: ComponentFixture<ListarSedesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarSedesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarSedesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
