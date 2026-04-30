import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ResumeAnalysisService } from './resume-analysis.service';

@UseGuards(AuthGuard)
@Controller('resume-analysis')
export class ResumeAnalysisController {
  constructor(private readonly resumeAnalysisService: ResumeAnalysisService) {}

  @Post(':resumeId')
  @HttpCode(HttpStatus.OK)
  analyzeResume(@Param('resumeId') resumeId: string) {
    return this.resumeAnalysisService.analyzeResume(resumeId);
  }
}
