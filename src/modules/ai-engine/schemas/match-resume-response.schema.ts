import { z } from 'zod';

const MatchResumeResponseSchema = z.object({
  matchScore: z.number().int().min(0).max(100).catch(0),

  fitLevel: z
    .enum(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'EXCELLENT'])
    .catch('VERY_LOW'),

  breakdown: z
    .object({
      skills: z.number().int().min(0).max(100).catch(0),
      experience: z.number().int().min(0).max(100).catch(0),
      responsibilities: z.number().int().min(0).max(100).catch(0),
      education: z.number().int().min(0).max(100).catch(0),
      certifications: z.number().int().min(0).max(100).catch(0),
      keywords: z.number().int().min(0).max(100).catch(0),
    })
    .catch({
      skills: 0,
      experience: 0,
      responsibilities: 0,
      education: 0,
      certifications: 0,
      keywords: 0,
    }),

  skills: z
    .object({
      matched: z.array(z.string()).catch([]),
      partial: z.array(z.string()).catch([]),
      missing: z.array(z.string()).catch([]),
    })
    .catch({
      matched: [],
      partial: [],
      missing: [],
    }),

  keywords: z
    .object({
      matched: z.array(z.string()).catch([]),
      missing: z.array(z.string()).catch([]),
    })
    .catch({
      matched: [],
      missing: [],
    }),

  responsibilities: z
    .object({
      matched: z.array(z.string()).catch([]),
      missing: z.array(z.string()).catch([]),
    })
    .catch({
      matched: [],
      missing: [],
    }),

  qualifications: z
    .object({
      matched: z.array(z.string()).catch([]),
      missing: z.array(z.string()).catch([]),
    })
    .catch({
      matched: [],
      missing: [],
    }),

  certifications: z
    .object({
      matched: z.array(z.string()).catch([]),
      missing: z.array(z.string()).catch([]),
    })
    .catch({
      matched: [],
      missing: [],
    }),

  experience: z
    .object({
      requiredYears: z.number().nullable().catch(null),
      candidateYears: z.number().nullable().catch(null),
      meetsRequirement: z.boolean().nullable().catch(null),
      notes: z.string().catch(''),
    })
    .catch({
      requiredYears: null,
      candidateYears: null,
      meetsRequirement: null,
      notes: '',
    }),

  roleFit: z
    .object({
      targetRole: z.string().nullable().catch(null),
      matchedRoles: z
        .array(
          z
            .object({
              title: z.string().catch(''),
              confidence: z.number().int().min(0).max(100).catch(0),
            })
            .catch({ title: '', confidence: 0 }),
        )
        .catch([]),
      alignmentScore: z.number().int().min(0).max(100).catch(0),
    })
    .catch({
      targetRole: null,
      matchedRoles: [],
      alignmentScore: 0,
    }),

  strengths: z.array(z.string()).catch([]),

  gaps: z.array(z.string()).catch([]),

  suggestions: z.array(z.string()).catch([]),

  recommendedLearning: z.array(z.string()).catch([]),

  priorityActions: z
    .array(
      z
        .object({
          title: z.string().catch(''),
          priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).catch('LOW'),
          reason: z.string().catch(''),
        })
        .catch({ title: '', priority: 'LOW', reason: '' }),
    )
    .catch([]),

  summary: z.string().catch(''),

  reason: z.string().catch(''),

  feedback: z
    .object({
      summary: z.string().catch(''),
      highlights: z.array(z.string()).catch([]),
      concerns: z.array(z.string()).catch([]),
    })
    .catch({
      summary: '',
      highlights: [],
      concerns: [],
    }),
});

export default MatchResumeResponseSchema;
