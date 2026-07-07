import { Test, TestingModule } from '@nestjs/testing';
import { PracticeService } from './practice.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';

describe('PracticeService', () => {
  let service: PracticeService;

  beforeEach(async () => {
    const mockPrismaService = {
      practiceSession: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      resume: {
        findUnique: jest.fn(),
      },
    };

    const mockAiEngineService = {
      generatePracticeSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AiEngineService,
          useValue: mockAiEngineService,
        },
      ],
    }).compile();

    service = module.get<PracticeService>(PracticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
