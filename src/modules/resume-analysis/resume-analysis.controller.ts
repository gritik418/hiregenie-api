import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ResumeAnalysisService } from './resume-analysis.service';
import MatchResumeInputDto from './dto/matchResume.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import MatchResumeSchema from './schemas/matchResume.schema';
import { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('resume-analysis')
export class ResumeAnalysisController {
  constructor(private readonly resumeAnalysisService: ResumeAnalysisService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  getResumeAnalysis(@Req() req: Request) {
    return this.resumeAnalysisService.getResumeAnalysis(req);
  }

  @Post(':resumeId')
  @HttpCode(HttpStatus.OK)
  analyzeResume(
    @Param('resumeId') resumeId: string,
    @Query('regenerate', new ParseBoolPipe({ optional: true }))
    regenerate: boolean = false,
    @Req() req: Request,
  ) {
    return this.resumeAnalysisService.analyzeResume(resumeId, regenerate, req);
  }

  @Post(':resumeId/match')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(MatchResumeSchema))
  matchResume(
    @Param('resumeId') resumeId: string,
    @Query('regenerate', new ParseBoolPipe({ optional: true }))
    regenerate: boolean = false,
    @Body()
    data: MatchResumeInputDto,
    @Req() req: Request,
  ) {
    return this.resumeAnalysisService.matchResume(
      resumeId,
      data,
      regenerate,
      req,
    );
  }
}
