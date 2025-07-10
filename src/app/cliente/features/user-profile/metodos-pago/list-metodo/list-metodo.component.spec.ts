import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMetodoComponent } from './list-metodo.component';

describe('ListMetodoComponent', () => {
  let component: ListMetodoComponent;
  let fixture: ComponentFixture<ListMetodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMetodoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMetodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
