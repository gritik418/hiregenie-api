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
import { AiInterviewService } from './ai-interview.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import CreateInterviewSessionSchema from './schemas/create-interview-session.schema';
import CreateInterviewSessionDto from './dto/create-interview-session.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@Controller('ai-interview')
@UseGuards(AuthGuard)
export class AiInterviewController {
  constructor(private readonly aiInterviewService: AiInterviewService) {}

  @Post('session')
  @HttpCode(HttpStatus.CREATED)
  async createInterviewSession(
    @Body(new ZodValidationPipe(CreateInterviewSessionSchema))
    data: CreateInterviewSessionDto,
    @Req() req: Request,
  ) {
    return this.aiInterviewService.createInterviewSession(data, req);
  }

  @Post('session/:sessionId/start')
  @HttpCode(HttpStatus.OK)
  async startInterviewSession(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    return this.aiInterviewService.startInterviewSession(sessionId, req);
  }

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  async getInterviewSessions(@Req() req: Request) {
    return this.aiInterviewService.getInterviewSessions(req);
  }

  @Get('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async getInterviewSessionDetails(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    return this.aiInterviewService.getInterviewSessionDetails(sessionId, req);
  }

  @Post('sessions/:sessionId/abandon')
  @HttpCode(HttpStatus.OK)
  async abandonInterviewSession(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    return this.aiInterviewService.abandonInterviewSession(sessionId, req);
  }

  @Get('sessions/:sessionId/report')
  @HttpCode(HttpStatus.OK)
  async getInterviewReport(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    return this.aiInterviewService.getInterviewReport(sessionId, req);
  }
}
