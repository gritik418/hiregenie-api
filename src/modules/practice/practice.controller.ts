import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import GeneratePracticeSessionInputDto from './dto/generate-practice-session.dto';
import SaveAnswerInputDto from './dto/save-answer.dto';
import { PracticeService } from './practice.service';
import GeneratePracticeSessionSchema from './schemas/generate-practice-session.schema';
import SaveAnswerSchema from './schemas/save-answer.schema';

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

  @Patch('sessions/:sessionId/questions/:questionId/answer')
  @HttpCode(HttpStatus.OK)
  saveAnswer(
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @Body(new ZodValidationPipe(SaveAnswerSchema))
    data: SaveAnswerInputDto,
    @Req() req: Request,
  ) {
    return this.practiceService.saveAnswer(sessionId, questionId, data, req);
  }

  @Patch('sessions/:sessionId/questions/:questionId/skip')
  @HttpCode(HttpStatus.OK)
  skipQuestion(
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @Req() req: Request,
  ) {
    return this.practiceService.skipQuestion(sessionId, questionId, req);
  }

  @Post('sessions/:sessionId/abandon')
  @HttpCode(HttpStatus.OK)
  abandonSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
    return this.practiceService.abandonSession(sessionId, req);
  }

  @Post('sessions/:sessionId/submit')
  @HttpCode(HttpStatus.OK)
  submitSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
    return this.practiceService.submitSession(sessionId, req);
  }
}
