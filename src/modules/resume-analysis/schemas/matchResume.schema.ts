import z from 'zod';

const MatchResumeSchema = z.object({
  jobTitle: z.string().min(1, 'Job Title is required.'),
  jobDescription: z.string().optional(),
  experienceRequired: z.string().optional(),
});

export default MatchResumeSchema;
