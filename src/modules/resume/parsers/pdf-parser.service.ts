import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfParserService {
  constructor(private readonly prismaService: PrismaService) {}

  async parseFromURL(fileUrl: string) {
    if (!fileUrl) throw new BadRequestException('File not found.');

    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    if (!response.data) throw new BadRequestException('File not found.');

    const buffer = Buffer.from(response.data);

    return this.parseBuffer(buffer);
  }

  async parseBuffer(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({
      data: buffer,
    });
    const summaryText = (await parser.getText()).text;

    return summaryText;
  }
}
