import { Test, TestingModule } from '@nestjs/testing';
import { OrgSdkController } from './org_sdk.controller';
import { OrgSdkService } from './org_sdk.service';

describe('OrgSdkController', () => {
  let controller: OrgSdkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgSdkController],
      providers: [OrgSdkService],
    }).compile();

    controller = module.get<OrgSdkController>(OrgSdkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
