import { Test, TestingModule } from '@nestjs/testing';
import { ResumeAnalysisService } from './resume-analysis.service';

describe('ResumeAnalysisService', () => {
  let service: ResumeAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResumeAnalysisService],
    }).compile();

    service = module.get<ResumeAnalysisService>(ResumeAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
