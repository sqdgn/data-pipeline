import { Test, TestingModule } from '@nestjs/testing';
import { InterfaceSocialService } from './interface-social.service';

describe('InterfaceSocialService', () => {
  let service: InterfaceSocialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterfaceSocialService],
    }).compile();

    service = module.get<InterfaceSocialService>(InterfaceSocialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
