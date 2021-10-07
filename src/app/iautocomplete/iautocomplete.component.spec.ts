import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IautocompleteComponent } from './iautocomplete.component';

describe('IautocompleteComponent', () => {
  let component: IautocompleteComponent;
  let fixture: ComponentFixture<IautocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IautocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IautocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
