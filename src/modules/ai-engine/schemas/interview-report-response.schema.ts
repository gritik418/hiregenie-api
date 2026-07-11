import { z } from 'zod';

export const InterviewReportResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),

  summary: z.string().min(20).max(1000),

  scores: z.object({
    technical: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
  }),

  strengths: z.array(z.string()).min(3).max(6),

  weaknesses: z.array(z.string()).min(2).max(5),

  improvements: z.array(z.string()).min(3).max(8),

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

  nextSteps: z.array(z.string()).min(3).max(8),
});

export default InterviewReportResponseSchema;
