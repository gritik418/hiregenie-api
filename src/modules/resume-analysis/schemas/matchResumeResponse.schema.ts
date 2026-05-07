import z from 'zod';

const MatchResumeResponseSchema = z.object({
  matchScore: z.number(),
  fitLevel: z.enum(['LOW', 'MODERATE', 'HIGH']),
  breakdown: z
    .object({
      skills: z.number().nullable(),
      experience: z.number().nullable(),
      projects: z.number().nullable(),
      education: z.number().nullable(),
    })
    .optional(),
  skills: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
    partial: z.array(z.string()),
  }),
  experience: z.object({
    requiredYears: z.number().nullable(),
    candidateYears: z.number().nullable(),
    meetsRequirement: z.boolean().nullable(),
    notes: z.string().optional(),
  }),
  roleFit: z.object({
    targetRole: z.string().nullable(),
    matchedRoles: z.array(z.string()),
    alignmentScore: z.number(),
  }),
  gaps: z.array(z.string()),
  suggestions: z.array(z.string()),
  learningPath: z.array(z.string()),
  summary: z.string(),
  reason: z.string(),
  feedback: z.object({
    summary: z.string(),
    highlights: z.array(z.string()),
  }),
});

export default MatchResumeResponseSchema;
