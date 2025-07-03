import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSalasComponent } from './crear-salas.component';

describe('CrearSalasComponent', () => {
  let component: CrearSalasComponent;
  let fixture: ComponentFixture<CrearSalasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSalasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearSalasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
