import { TestBed } from '@angular/core/testing';

import { NotificationsDataService } from './notifications-data.service';

describe('NotificationsDataService', () => {
  let service: NotificationsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
