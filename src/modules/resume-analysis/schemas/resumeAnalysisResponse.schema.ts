import { z } from 'zod';

const ResumeAnalysisResponseSchema = z.object({
  breakdown: z.object({
    keywords: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    projects: z.number().min(0).max(100),
    formatting: z.number().min(0).max(100),
  }),
  recommendedRoles: z.array(
    z.object({
      title: z.string(),
      confidence: z.number().min(0).max(100),
    }),
  ),
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  gaps: z.array(z.string()),
  suggestions: z.array(z.string()),
  keywords: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
  }),
  summary: z.string(),
  reason: z.string(),
  feedback: z.object({
    summary: z.string(),
    highlights: z.array(z.string()),
    areasToImprove: z.array(z.string()),
  }),
});

export default ResumeAnalysisResponseSchema;
