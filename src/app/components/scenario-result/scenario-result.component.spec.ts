import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioResultComponent } from './scenario-result.component';

describe('ScenarioResultComponent', () => {
  let component: ScenarioResultComponent;
  let fixture: ComponentFixture<ScenarioResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenarioResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScenarioResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
