import {TestBed} from '@angular/core/testing';

import {DiscoveryService} from './discovery.service';

describe('SearchService', () => {
  let service: DiscoveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscoveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
