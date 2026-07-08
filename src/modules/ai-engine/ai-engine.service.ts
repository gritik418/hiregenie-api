import { ChatOllama } from '@langchain/ollama';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMessage, HumanMessage, SystemMessage } from 'langchain';
import { ZodSchema } from 'zod';
import { PromptBuilder } from './builders/prompt.builder';
import AISummaryResponseDto from './dto/ai-summary-response.dto';
import MatchResumeResponseDto from './dto/match-resume-response.dto';
import PracticeSessionResponseDto from './dto/practice-session-response.dto';
import ResumeAnalysisResponseDto from './dto/resume-analysis-response.dto';
import { AI_SUMMARY_PROMPTS } from './prompts/ai-summary';
import { PRACTICE_SESSION_PROMPTS } from './prompts/practice-session';
import { RESUME_ANALYSIS_PROMPTS } from './prompts/resume-analysis';
import { RESUME_MATCH_PROMPTS } from './prompts/resume-match';
import { AISummaryResponseSchema } from './schemas/ai-summary-response.schema';
import MatchResumeResponseSchema from './schemas/match-resume-response.schema';
import PracticeSessionResponseSchema from './schemas/practice-session-response.schema';
import ResumeAnalysisResponseSchema from './schemas/resume-analysis-response.schema';
import { PRACTICE_SESSION_EVALUATOR_PROMPTS } from './prompts/practice-session-evaluator';
import PracticeSessionEvaluationResponseSchema from './schemas/practice-session-evaluation-response.schema';
import PracticeSessionEvaluationResponseDto from './dto/practice-session-evaluation-response.dto';
import { HUMAN_PROMPT } from './prompts/practice-session-evaluator/human.prompt';
import { Difficulty } from 'generated/prisma/enums';
import { PracticeSession } from 'generated/prisma/client';

@Injectable()
export class AiEngineService {
  private readonly model: ChatOllama;
  private readonly strictModel: ChatOllama;

  constructor(
    private readonly promptBuilder: PromptBuilder,
    private readonly configService: ConfigService,
  ) {
    this.model = new ChatOllama({
      model: this.configService.getOrThrow<string>('OLLAMA_MODEL'),
      baseUrl: this.configService.getOrThrow<string>('OLLAMA_BASE_URL'),
      temperature: 0.7,
      format: 'json',
      numCtx: 16384,
    });
    this.strictModel = new ChatOllama({
      model: this.configService.getOrThrow<string>('OLLAMA_MODEL'),
      baseUrl: this.configService.getOrThrow<string>('OLLAMA_BASE_URL'),
      temperature: 0.0,
      format: 'json',
      numCtx: 16384,
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

    const response = await this.strictModel.invoke(messages);

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
Below is the input data for the resume match analysis. Use this info as defined below:
1. "Current Date": Reference date to accurately calculate the candidate's work durations/tenures.
2. "Resume": The candidate's resume/summary content. This is the sole source of truth for their actual history, skills, education, and certifications.
3. "Job Title": Target role title, used to assess general domain/seniority alignment and role suitability.
4. "Job Description": Duties and expectations, used to match candidate's skills, keywords, and responsibilities.
5. "Required Experience": Minimum years of experience expected, used to calculate score alignment and determine overall fit level/caps.

*CRITICAL WARNING*: The "Job Title", "Job Description", and "Required Experience" fields represent the EMPLOYER'S job posting requirements and expectations. They contain absolutely ZERO information about the candidate. You must NEVER copy skills, keywords, or responsibilities from these sections as if they belong to the candidate unless they are explicitly present inside the "Resume" text block.

### INPUT DATA VALUES:
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

    const response = await this.strictModel.invoke(messages);

    const jsonResponse = JSON.parse(response.text);

    const result = MatchResumeResponseSchema.safeParse(jsonResponse);

    if (!result.success) {
      throw new BadRequestException('Failed to parse AI response');
    }

    return result.data;
  }

  async generatePracticeSession(
    targetRole: string,
    difficulty: string,
    rawText: string,
    questionCount: number = 5,
    customInstructions?: string,
  ): Promise<PracticeSessionResponseDto> {
    const messages: BaseMessage[] = [];

    messages.push(
      new SystemMessage(this.promptBuilder.build(...PRACTICE_SESSION_PROMPTS)),
    );
    messages.push(
      new HumanMessage(`
Target Role:
${targetRole}

Difficulty Level:
${difficulty}

Question Count:
${questionCount}

Custom Instructions:
${customInstructions || 'Not provided'}

Resume:
${rawText}
`),
    );

    const response = await this.model.invoke(messages);

    const jsonResponse = JSON.parse(response.text);

    const result = PracticeSessionResponseSchema.safeParse(jsonResponse);

    if (!result.success) {
      throw new BadRequestException('Failed to parse AI response');
    }

    const totalSeconds = result.data?.questions.reduce(
      (sum, question) => sum + question.estimatedAnswerTimeSeconds + 30,
      0,
    );
    const estimatedDurationMinutes = Math.ceil(totalSeconds / 60);

    result.data.overview.estimatedDurationMinutes = Math.max(
      1,
      estimatedDurationMinutes,
    );
    return result.data;
  }

  async evaluatePracticeSession(
    session: PracticeSession,
  ): Promise<PracticeSessionEvaluationResponseDto> {
    const messages: BaseMessage[] = [];

    messages.push(
      new SystemMessage(
        this.promptBuilder.build(...PRACTICE_SESSION_EVALUATOR_PROMPTS),
      ),
    );

    messages.push(
      new HumanMessage(
        HUMAN_PROMPT(session.targetRole, session.difficulty, session),
      ),
    );

    console.log(messages);

    const response = await this.strictModel.invoke(messages);
    const rawText = response.text || response.content.toString();
    console.log("RAW AI RESPONSE:", rawText);

    try {
      const result = this.extractJSON<PracticeSessionEvaluationResponseDto>(
        rawText,
        PracticeSessionEvaluationResponseSchema,
      );
      return result;
    } catch (e) {
      console.error("EVALUATION PARSE ERROR:", e);
      throw new BadRequestException({
        message: 'Failed to parse AI response',
        error: e?.message || e,
        text: rawText,
      });
    }
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

      const clean = text
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
