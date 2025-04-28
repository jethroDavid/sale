import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickPage } from './pick.page';

describe('PickPage', () => {
  let component: PickPage;
  let fixture: ComponentFixture<PickPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PickPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
