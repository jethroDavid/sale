import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckerPage } from './checker.page';

describe('CheckerPage', () => {
  let component: CheckerPage;
  let fixture: ComponentFixture<CheckerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
