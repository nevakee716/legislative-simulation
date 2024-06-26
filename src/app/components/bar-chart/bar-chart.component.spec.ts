import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondRoundBeforeWithdrawComponent } from './bar-chart.component';

describe('SecondRoundBeforeWithdrawComponent', () => {
  let component: SecondRoundBeforeWithdrawComponent;
  let fixture: ComponentFixture<SecondRoundBeforeWithdrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondRoundBeforeWithdrawComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecondRoundBeforeWithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
