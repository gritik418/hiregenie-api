import { z } from 'zod';

const MatchResumeResponseSchema = z.object({
  matchScore: z.number().int().min(0).max(100),

  fitLevel: z.enum(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'EXCELLENT']),

  breakdown: z.object({
    skills: z.number().int().min(0).max(100),
    experience: z.number().int().min(0).max(100),
    responsibilities: z.number().int().min(0).max(100),
    education: z.number().int().min(0).max(100),
    certifications: z.number().int().min(0).max(100),
    keywords: z.number().int().min(0).max(100),
  }),

  skills: z.object({
    matched: z.array(z.string()),
    partial: z.array(z.string()),
    missing: z.array(z.string()),
  }),

  keywords: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
  }),

  responsibilities: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
  }),

  qualifications: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
  }),

  certifications: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
  }),

  experience: z.object({
    requiredYears: z.number().nullable(),
    candidateYears: z.number().nullable(),
    meetsRequirement: z.boolean().nullable(),
    notes: z.string(),
  }),

  roleFit: z.object({
    targetRole: z.string().nullable(),

    matchedRoles: z.array(
      z.object({
        title: z.string(),
        confidence: z.number().int().min(0).max(100),
      }),
    ),

    alignmentScore: z.number().int().min(0).max(100),
  }),

  strengths: z.array(z.string()),

  gaps: z.array(z.string()),

  suggestions: z.array(z.string()),

  recommendedLearning: z.array(z.string()),

  priorityActions: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
      reason: z.string(),
    }),
  ),

  summary: z.string(),

  reason: z.string(),

  feedback: z.object({
    summary: z.string(),
    highlights: z.array(z.string()),
    concerns: z.array(z.string()),
  }),
});

export default MatchResumeResponseSchema;
