import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { PdfParserService } from './parsers/pdf-parser.service';

@Module({
  controllers: [ResumeController],
  providers: [ResumeService, PdfParserService],
  exports: [PdfParserService],
})
export class ResumeModule {}
