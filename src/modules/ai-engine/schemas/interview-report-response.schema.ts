import { z } from 'zod';

export const InterviewReportResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),

  summary: z.string(),

  scores: z.object({
    technical: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
  }),

  strengths: z.array(z.string()),

  weaknesses: z.array(z.string()),

  improvements: z.array(z.string()),

  skills: z.object({
    demonstrated: z.array(z.string()),
    missing: z.array(z.string()),
  }),

  questionAnalysis: z.array(
    z.object({
      question: z.string(),

      candidateAnswer: z.string(),

      score: z.number().min(0).max(100),

      feedback: z.string(),

      idealAnswer: z.string(),
    }),
  ),

  recommendation: z.object({
    decision: z.enum(['STRONG_HIRE', 'HIRE', 'BORDERLINE', 'NO_HIRE']),

    confidence: z.number().min(0).max(100),

    reason: z.string(),
  }),

  nextSteps: z.array(z.string()),
});

export default InterviewReportResponseSchema;
