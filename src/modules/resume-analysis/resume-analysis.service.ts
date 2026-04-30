import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PdfParserService } from '../resume/parsers/pdf-parser.service';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pdfParserService: PdfParserService,
  ) {}

  async analyzeResume(resumeId: string) {
    const data = await this.pdfParserService.parseFromURL(resumeId);

    return { data };
  }
}
