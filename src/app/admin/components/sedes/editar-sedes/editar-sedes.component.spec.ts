import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarSedesComponent } from './editar-sedes.component';

describe('EditarSedesComponent', () => {
  let component: EditarSedesComponent;
  let fixture: ComponentFixture<EditarSedesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarSedesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarSedesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
