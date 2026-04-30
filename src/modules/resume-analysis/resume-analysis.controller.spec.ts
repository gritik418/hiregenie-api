import { Test, TestingModule } from '@nestjs/testing';
import { ResumeAnalysisController } from './resume-analysis.controller';

describe('ResumeAnalysisController', () => {
  let controller: ResumeAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeAnalysisController],
    }).compile();

    controller = module.get<ResumeAnalysisController>(ResumeAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
