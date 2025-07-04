import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearActorComponent } from './crear-actor.component';

describe('CrearActorComponent', () => {
  let component: CrearActorComponent;
  let fixture: ComponentFixture<CrearActorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearActorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearActorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
