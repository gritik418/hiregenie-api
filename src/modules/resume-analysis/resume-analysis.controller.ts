import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ResumeAnalysisService } from './resume-analysis.service';
import MatchResumeInputDto from './dto/matchResume.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import MatchResumeSchema from './schemas/matchResume.schema';

@UseGuards(AuthGuard)
@Controller('resume-analysis')
export class ResumeAnalysisController {
  constructor(private readonly resumeAnalysisService: ResumeAnalysisService) {}

  @Post(':resumeId')
  @HttpCode(HttpStatus.OK)
  analyzeResume(
    @Param('resumeId') resumeId: string,
    @Query('regenerate', new ParseBoolPipe({ optional: true }))
    regenerate: boolean = false,
  ) {
    return this.resumeAnalysisService.analyzeResume(resumeId, regenerate);
  }

  @Post(':resumeId/match')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(MatchResumeSchema))
  matchResume(
    @Param('resumeId') resumeId: string,
    @Body() data: MatchResumeInputDto,
  ) {
    return this.resumeAnalysisService.matchResume(resumeId, data);
  }
}
