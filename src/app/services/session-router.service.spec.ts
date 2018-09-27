/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SessionRouterService } from './session-router.service';

describe('Service: SessionRouter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionRouterService]
    });
  });

  it('should ...', inject([SessionRouterService], (service: SessionRouterService) => {
    expect(service).toBeTruthy();
  }));
});
