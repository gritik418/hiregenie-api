import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfParserService {
  constructor() {}

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
