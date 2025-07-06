import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarMetodoComponent } from './editar-metodo.component';

describe('EditarMetodoComponent', () => {
  let component: EditarMetodoComponent;
  let fixture: ComponentFixture<EditarMetodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarMetodoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarMetodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
