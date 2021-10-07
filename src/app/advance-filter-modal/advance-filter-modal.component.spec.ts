import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceFilterModalComponent } from './advance-filter-modal.component';

describe('AdvanceFilterModalComponent', () => {
  let component: AdvanceFilterModalComponent;
  let fixture: ComponentFixture<AdvanceFilterModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvanceFilterModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceFilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
