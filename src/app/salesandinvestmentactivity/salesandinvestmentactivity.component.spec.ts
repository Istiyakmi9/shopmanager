import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesandinvestmentactivityComponent } from './salesandinvestmentactivity.component';

describe('SalesandinvestmentactivityComponent', () => {
  let component: SalesandinvestmentactivityComponent;
  let fixture: ComponentFixture<SalesandinvestmentactivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesandinvestmentactivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesandinvestmentactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
