import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnCarteleraComponent } from './en-cartelera.component';

describe('EnCarteleraComponent', () => {
  let component: EnCarteleraComponent;
  let fixture: ComponentFixture<EnCarteleraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnCarteleraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnCarteleraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
