import { ChatOllama } from '@langchain/ollama';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class AiEngineService {
  private model = new ChatOllama({
    model: process.env.OLLAMA_MODEL as string,
    baseUrl: process.env.OLLAMA_BASE_URL as string,
  });

  async generateResponseInJSON<T>(
    prompt: string,
    zodSchema: ZodSchema<T>,
  ): Promise<T> {
    const response = await this.model.invoke([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const raw = response.content.toString();

    const result = this.extractJSON<T>(raw, zodSchema);

    return result;
  }

  private extractJSON<T>(text: string, schema: ZodSchema): T {
    try {
      if (!text) throw new Error('Empty AI response');

      let clean = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found');

      const jsonString = match[0];

      const parsed = JSON.parse(jsonString);

      const validated = schema.parse(parsed);

      return validated as T;
    } catch {
      throw new BadRequestException('Invalid AI response');
    }
  }
}
