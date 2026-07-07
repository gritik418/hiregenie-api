import { Test, TestingModule } from '@nestjs/testing';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { JwtService } from '@nestjs/jwt';

describe('PracticeController', () => {
  let controller: PracticeController;

  beforeEach(async () => {
    const mockPracticeService = {
      getPracticeSessions: jest.fn(),
      getPracticeSession: jest.fn(),
      generatePracticeSession: jest.fn(),
    };

    const mockJwtService = {
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PracticeController],
      providers: [
        {
          provide: PracticeService,
          useValue: mockPracticeService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<PracticeController>(PracticeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
