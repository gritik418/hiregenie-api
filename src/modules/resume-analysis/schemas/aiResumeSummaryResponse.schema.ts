import z from 'zod';

const roleSchema = z.object({
  title: z.string().catch('Unknown'),
  company: z.string().catch('Unknown'),
  startDate: z.string().catch(''),
  endDate: z.string().catch(''),
  durationMonths: z.number().catch(0),
  experienceSummary: z.string().catch(''),
});

const projectSchema = z.object({
  name: z.string().catch(''),
  description: z.string().catch(''),
  technologies: z.array(z.string().catch('')).catch([]),
  link: z.string().catch(''),
});

const AiResumeSummaryResponseSchema = z.object({
  experienceAnalysis: z
    .object({
      validRoles: z.array(roleSchema).catch([]),
      totalExperienceMonths: z.number().catch(0),
      experienceLevel: z.string().catch('Entry-level'),
    })
    .catch({ validRoles: [], totalExperienceMonths: 0, experienceLevel: 'Entry-level' }),
  projects: z.array(projectSchema).catch([]),
  summary: z.string().catch(''),
});

export default AiResumeSummaryResponseSchema;
