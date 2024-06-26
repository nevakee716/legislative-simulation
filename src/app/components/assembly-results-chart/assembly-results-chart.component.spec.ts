import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssemblyResultsChartComponent } from './assembly-results-chart.component';

describe('AssemblyResultsChartComponent', () => {
  let component: AssemblyResultsChartComponent;
  let fixture: ComponentFixture<AssemblyResultsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssemblyResultsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssemblyResultsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
