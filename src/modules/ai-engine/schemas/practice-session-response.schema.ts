import { z } from 'zod';

const QuestionCategorySchema = z.enum([
  'TECHNICAL',
  'BEHAVIORAL',
  'EXPERIENCE',
  'SITUATIONAL',
  'ROLE_SPECIFIC',
  'PROBLEM_SOLVING',
  'CASE_STUDY',
  'DOMAIN_KNOWLEDGE',
  'LEADERSHIP',
  'COMMUNICATION',
  'CULTURE_FIT',
  'GENERAL',
]);

const DifficultySchema = z.enum([
  'BEGINNER',
  'EASY',
  'MEDIUM',
  'HARD',
  'EXPERT',
]);

const PracticeSessionResponseSchema = z.object({
  overview: z.object({
    summary: z.string(),
    focusAreas: z.array(z.string()),
    estimatedDurationMinutes: z.number().int().positive(),
    instructions: z.array(z.string()),
  }),

  questions: z.array(
    z.object({
      question: z.string(),
      category: QuestionCategorySchema,
      difficulty: DifficultySchema,
      expectedAnswer: z.string(),
      keyPoints: z.array(z.string()),
      hints: z.array(z.string()),
      evaluationCriteria: z.array(z.string()),
      estimatedAnswerTimeSeconds: z.number().int().positive(),
      tags: z.array(z.string()),
    }),
  ),
});

export default PracticeSessionResponseSchema;
