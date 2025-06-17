import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProximosEstrenosComponent } from './proximos-estrenos.component';

describe('ProximosEstrenosComponent', () => {
  let component: ProximosEstrenosComponent;
  let fixture: ComponentFixture<ProximosEstrenosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProximosEstrenosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProximosEstrenosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
