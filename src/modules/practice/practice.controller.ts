import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PracticeService } from './practice.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import GeneratePracticeSessionSchema from './schemas/generate-practice-session.schema';
import GeneratePracticeSessionInputDto from './dto/generate-practice-session.dto';
import { Request } from 'express';

@Controller('practice')
@UseGuards(AuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  getPracticeSessions(@Req() req: Request) {
    return this.practiceService.getPracticeSessions(req);
  }

  @Get('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  getPracticeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    return this.practiceService.getPracticeSession(sessionId, req);
  }

  @Post(':resumeId/generate')
  @HttpCode(HttpStatus.CREATED)
  generatePracticeSession(
    @Param('resumeId') resumeId: string,
    @Body(new ZodValidationPipe(GeneratePracticeSessionSchema))
    data: GeneratePracticeSessionInputDto,
    @Req() req: Request,
  ) {
    return this.practiceService.generatePracticeSession(resumeId, data, req);
  }

  @Post('sessions/:sessionId/start')
  @HttpCode(HttpStatus.OK)
  startPracticeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    return this.practiceService.startPracticeSession(sessionId, req);
  }
}
