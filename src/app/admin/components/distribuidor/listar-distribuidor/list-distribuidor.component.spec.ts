import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDistribuidorComponent } from './list-distribuidor.component';

describe('ListDistribuidorComponent', () => {
  let component: ListDistribuidorComponent;
  let fixture: ComponentFixture<ListDistribuidorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDistribuidorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDistribuidorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
