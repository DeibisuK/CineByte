import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosEspecialesComponent } from './eventos-especiales.component';

describe('EventosEspecialesComponent', () => {
  let component: EventosEspecialesComponent;
  let fixture: ComponentFixture<EventosEspecialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosEspecialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosEspecialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
