import { z } from 'zod';

const QuestionCategorySchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.toUpperCase().replace(/\s+/g, '_');
  }
  return val;
}, z.enum([
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
]));

const DifficultySchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.toUpperCase();
  }
  return val;
}, z.enum([
  'BEGINNER',
  'EASY',
  'MEDIUM',
  'HARD',
  'EXPERT',
]));

const robustIntSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? val : Math.round(parsed);
  }
  if (typeof val === 'number') {
    return Math.round(val);
  }
  return val;
}, z.number().int().positive());

const PracticeSessionResponseSchema = z.object({
  overview: z.object({
    summary: z.string(),
    focusAreas: z.array(z.string()),
    estimatedDurationMinutes: robustIntSchema,
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
      estimatedAnswerTimeSeconds: robustIntSchema,
      tags: z.array(z.string()),
    }),
  ),
});

export default PracticeSessionResponseSchema;
