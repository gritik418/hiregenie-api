import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptBuilder {
  build(...prompts: string[]): string {
    return prompts.join('\n');
  }
}
