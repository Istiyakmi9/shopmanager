import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseitemsComponent } from './purchaseitems.component';

describe('PurchaseitemsComponent', () => {
  let component: PurchaseitemsComponent;
  let fixture: ComponentFixture<PurchaseitemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseitemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
