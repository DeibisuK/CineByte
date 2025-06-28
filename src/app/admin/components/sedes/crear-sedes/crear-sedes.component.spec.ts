import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSedesComponent } from './crear-sedes.component';

describe('CrearSedesComponent', () => {
  let component: CrearSedesComponent;
  let fixture: ComponentFixture<CrearSedesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSedesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearSedesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
