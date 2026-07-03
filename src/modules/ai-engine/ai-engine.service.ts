import { ChatOllama } from '@langchain/ollama';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMessage, HumanMessage, SystemMessage } from 'langchain';
import { ZodSchema } from 'zod';
import { PromptBuilder } from './builders/prompt.builder';
import AISummaryResponseDto from './dto/ai-summary-response.dto';
import { AI_SUMMARY_PROMPTS } from './prompts/ai-summary';
import { AISummaryResponseSchema } from './schemas/ai-summary-response.schema';
import ResumeAnalysisResponseDto from './dto/resume-analysis-response.dto';
import { RESUME_ANALYSIS_PROMPTS } from './prompts/resume-analysis';
import ResumeAnalysisResponseSchema from './schemas/resume-analysis-response.schema';
import MatchResumeResponseDto from './dto/match-resume-response.dto';
import { RESUME_MATCH_PROMPTS } from './prompts/resume-match';
import MatchResumeResponseSchema from './schemas/match-resume-response.schema';

@Injectable()
export class AiEngineService {
  private readonly model: ChatOllama;

  constructor(
    private readonly promptBuilder: PromptBuilder,
    private readonly configService: ConfigService,
  ) {
    this.model = new ChatOllama({
      model: this.configService.getOrThrow<string>('OLLAMA_MODEL'),
      baseUrl: this.configService.getOrThrow<string>('OLLAMA_BASE_URL'),
      temperature: 0.7,
      format: 'json',
    });
  }

  async generateAiSummary(rawText: string): Promise<AISummaryResponseDto> {
    const messages: BaseMessage[] = [];

    messages.push(
      new SystemMessage(this.promptBuilder.build(...AI_SUMMARY_PROMPTS)),
    );

    messages.push(new HumanMessage(rawText));

    const response = await this.model.invoke(messages);

    const jsonResponse = JSON.parse(response.text);

    const result = AISummaryResponseSchema.safeParse(jsonResponse);

    if (!result.success) {
      throw new BadRequestException('Failed to parse AI response');
    }

    return result.data;
  }

  async generateResumeAnalysis(
    aiSummary: string,
  ): Promise<ResumeAnalysisResponseDto> {
    const messages: BaseMessage[] = [];

    messages.push(
      new SystemMessage(this.promptBuilder.build(...RESUME_ANALYSIS_PROMPTS)),
    );

    messages.push(new HumanMessage(aiSummary));

    const response = await this.model.invoke(messages);

    console.log('response', response);
    const jsonResponse = JSON.parse(response.text);

    const result = ResumeAnalysisResponseSchema.safeParse(jsonResponse);

    if (!result.success) {
      throw new BadRequestException('Failed to parse AI response');
    }

    return result.data;
  }

  async generateResumeMatchAnalysis(
    aiSummary: string,
    jobTitle: string,
    jobDescription: string,
    requiredExperience: string,
  ): Promise<MatchResumeResponseDto> {
    const messages: BaseMessage[] = [];
    const currentDate = new Date().toISOString().split('T')[0];

    messages.push(
      new SystemMessage(this.promptBuilder.build(...RESUME_MATCH_PROMPTS)),
    );
    messages.push(
      new HumanMessage(`
Current Date:
${currentDate}

Resume:
${aiSummary}

Job Title:
${jobTitle}

Job Description:
${jobDescription || 'Not Provided'}

Required Experience:
${requiredExperience || 'Not Provided'}
`),
    );

    const response = await this.model.invoke(messages);

    console.log('response', response);
    const jsonResponse = JSON.parse(response.text);

    const result = MatchResumeResponseSchema.safeParse(jsonResponse);

    if (!result.success) {
      throw new BadRequestException('Failed to parse AI response');
    }

    return result.data;
  }

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
    } catch (e) {
      throw new BadRequestException({
        message: 'Invalid AI response',
        e: e?.message,
        text,
      });
    }
  }
}
