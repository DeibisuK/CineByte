import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdadesComponent } from './edades.component';

describe('EdadesComponent', () => {
  let component: EdadesComponent;
  let fixture: ComponentFixture<EdadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
