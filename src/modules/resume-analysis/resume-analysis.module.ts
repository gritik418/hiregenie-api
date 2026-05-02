import { Module } from '@nestjs/common';
import { ResumeAnalysisService } from './resume-analysis.service';
import { ResumeAnalysisController } from './resume-analysis.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { ResumeModule } from '../resume/resume.module';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [PrismaModule, ResumeModule, AiEngineModule],
  providers: [ResumeAnalysisService],
  controllers: [ResumeAnalysisController],
})
export class ResumeAnalysisModule {}
