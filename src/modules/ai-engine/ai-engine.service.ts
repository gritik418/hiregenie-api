import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';

@Injectable()
export class AiEngineService {
  private model = new ChatOllama({
    model: 'phi3',
    baseUrl: 'http://host.docker.internal:11434',
  });

  async analyzeResume(rawText: string) {
    const prompt = `
You are an expert recruiter.

Analyze the resume and return ONLY valid JSON.

RULES:
- No explanation
- No markdown
- No \`\`\`
- Only JSON output

FORMAT:
{
  "score": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "keywords": string[],
  "reason": string
}

RESUME:
${rawText.slice(0, 5000)}
`;

    const response = await this.model.invoke([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const raw = response.content.toString();

    const result = this.extractJSON(raw);

    return result;
  }

  private extractJSON(text: string) {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found');

      return JSON.parse(match[0]);
    } catch {
      throw new Error('Invalid AI response');
    }
  }
}
