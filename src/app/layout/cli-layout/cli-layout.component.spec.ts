import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CliLayoutComponent } from './cli-layout.component';

describe('CliLayoutComponent', () => {
  let component: CliLayoutComponent;
  let fixture: ComponentFixture<CliLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CliLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CliLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
