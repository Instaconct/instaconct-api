import { Test, TestingModule } from '@nestjs/testing';
import { OrgSdkService } from './org_sdk.service';

describe('OrgSdkService', () => {
  let service: OrgSdkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgSdkService],
    }).compile();

    service = module.get<OrgSdkService>(OrgSdkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
