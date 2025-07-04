import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSalasComponent } from './edit-salas.component';

describe('EditSalasComponent', () => {
  let component: EditSalasComponent;
  let fixture: ComponentFixture<EditSalasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSalasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSalasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
