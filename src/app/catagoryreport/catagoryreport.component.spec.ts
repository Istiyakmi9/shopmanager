import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatagoryreportComponent } from './catagoryreport.component';

describe('CatagoryreportComponent', () => {
  let component: CatagoryreportComponent;
  let fixture: ComponentFixture<CatagoryreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatagoryreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatagoryreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
