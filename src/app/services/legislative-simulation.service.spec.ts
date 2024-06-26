import { TestBed } from '@angular/core/testing';

import { LegislativeSimulationService } from './legislative-simulation.service';

describe('LegislativeSimulationService', () => {
  let service: LegislativeSimulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LegislativeSimulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
