import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPeliculaComponent } from './listar-pelicula.component';

describe('ListarPeliculaComponent', () => {
  let component: ListarPeliculaComponent;
  let fixture: ComponentFixture<ListarPeliculaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPeliculaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPeliculaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
