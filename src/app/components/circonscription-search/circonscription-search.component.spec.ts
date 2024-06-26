import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CirconscriptionSearchComponent } from './circonscription-search.component';

describe('CirconscriptionSearchComponent', () => {
  let component: CirconscriptionSearchComponent;
  let fixture: ComponentFixture<CirconscriptionSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CirconscriptionSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CirconscriptionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
