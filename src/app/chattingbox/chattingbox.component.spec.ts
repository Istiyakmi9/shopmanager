import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChattingboxComponent } from './chattingbox.component';

describe('ChattingboxComponent', () => {
  let component: ChattingboxComponent;
  let fixture: ComponentFixture<ChattingboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChattingboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChattingboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
