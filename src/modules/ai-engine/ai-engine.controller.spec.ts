import { Test, TestingModule } from '@nestjs/testing';
import { AiEngineController } from './ai-engine.controller';

describe('AiEngineController', () => {
  let controller: AiEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiEngineController],
    }).compile();

    controller = module.get<AiEngineController>(AiEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
