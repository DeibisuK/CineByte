import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignSalasComponent } from './asign-salas.component';

describe('AsignSalasComponent', () => {
  let component: AsignSalasComponent;
  let fixture: ComponentFixture<AsignSalasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignSalasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignSalasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
