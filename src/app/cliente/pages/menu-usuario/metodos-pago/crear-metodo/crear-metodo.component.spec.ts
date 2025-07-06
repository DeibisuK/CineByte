import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearMetodoComponent } from './crear-metodo.component';

describe('CrearMetodoComponent', () => {
  let component: CrearMetodoComponent;
  let fixture: ComponentFixture<CrearMetodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearMetodoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearMetodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
