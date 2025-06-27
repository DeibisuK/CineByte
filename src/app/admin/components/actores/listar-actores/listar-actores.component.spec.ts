import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarActoresComponent } from './listar-actores.component';

describe('ListarActoresComponent', () => {
  let component: ListarActoresComponent;
  let fixture: ComponentFixture<ListarActoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarActoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarActoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
