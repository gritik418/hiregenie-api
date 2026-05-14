import { Module } from '@nestjs/common';
import { AiEngineController } from './ai-engine.controller';
import { AiEngineService } from './ai-engine.service';
import { MatchResumeChain } from './chains/match-resume.chain';
import { AnalyzeResumeChain } from './chains/analyze-resume.chain';

@Module({
  controllers: [AiEngineController],
  providers: [AiEngineService, MatchResumeChain, AnalyzeResumeChain],
  exports: [AiEngineService, MatchResumeChain, AnalyzeResumeChain],
})
export class AiEngineModule {}
