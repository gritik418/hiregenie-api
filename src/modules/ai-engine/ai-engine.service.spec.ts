import { Test, TestingModule } from '@nestjs/testing';
import { AiEngineService } from './ai-engine.service';
import { PromptBuilder } from './builders/prompt.builder';
import { ConfigService } from '@nestjs/config';

describe('AiEngineService', () => {
  let service: AiEngineService;

  beforeEach(async () => {
    const mockPromptBuilder = {
      build: jest.fn().mockImplementation((...args) => args.join('\n')),
    };

    const mockConfigService = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'OLLAMA_MODEL') return 'qwen2.5';
        if (key === 'OLLAMA_BASE_URL') return 'http://localhost:11434';
        return '';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiEngineService,
        {
          provide: PromptBuilder,
          useValue: mockPromptBuilder,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiEngineService>(AiEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

