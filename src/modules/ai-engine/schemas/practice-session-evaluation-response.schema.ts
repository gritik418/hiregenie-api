import { z } from 'zod';

const PracticeSessionEvaluationResponseSchema = z.object({
  questionEvaluations: z.array(
    z.object({
      questionId: z.string(),

      score: z.number().int().min(0).max(100),

      performanceLevel: z.enum([
        'POOR',
        'FAIR',
        'GOOD',
        'VERY_GOOD',
        'EXCELLENT',
      ]),

      strengths: z.array(z.string()),

      weaknesses: z.array(z.string()),

      missedKeyPoints: z.array(z.string()),

      suggestions: z.array(z.string()),

      feedback: z.object({
        summary: z.string(),
        idealAnswer: z.string(),
      }),
    }),
  ),

  overallScore: z.number().int().min(0).max(100),

  performanceLevel: z.enum(['POOR', 'FAIR', 'GOOD', 'VERY_GOOD', 'EXCELLENT']),

  hiringRecommendation: z.enum([
    'NOT_RECOMMENDED',
    'CONSIDER',
    'RECOMMENDED',
    'STRONGLY_RECOMMENDED',
  ]),

  breakdown: z.object({
    technicalKnowledge: z.number().int().min(0).max(100),
    problemSolving: z.number().int().min(0).max(100),
    communication: z.number().int().min(0).max(100),
    confidence: z.number().int().min(0).max(100),
    completeness: z.number().int().min(0).max(100),
  }),

  strengths: z.array(z.string()),

  weaknesses: z.array(z.string()),

  suggestions: z.array(z.string()),

  nextSteps: z.array(z.string()),

  summary: z.string(),

  reason: z.string(),

  feedback: z.object({
    summary: z.string(),
    highlights: z.array(z.string()),
    areasToImprove: z.array(z.string()),
    overallAssessment: z.string(),
  }),
});

export default PracticeSessionEvaluationResponseSchema;
