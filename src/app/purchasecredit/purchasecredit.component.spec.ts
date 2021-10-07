import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasecreditComponent } from './purchasecredit.component';

describe('PurchasecreditComponent', () => {
  let component: PurchasecreditComponent;
  let fixture: ComponentFixture<PurchasecreditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchasecreditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasecreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
