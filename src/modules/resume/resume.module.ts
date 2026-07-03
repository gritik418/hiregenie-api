import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { PdfParserService } from './parsers/pdf-parser.service';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [AiEngineModule],
  controllers: [ResumeController],
  providers: [ResumeService, PdfParserService],
  exports: [PdfParserService, ResumeService],
})
export class ResumeModule {}
