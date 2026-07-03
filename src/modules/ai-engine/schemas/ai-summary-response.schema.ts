import { z } from 'zod';

export const AISummaryResponseSchema = z.object({
  summary: z.string(),
});

export type AISummaryResponse = z.infer<typeof AISummaryResponseSchema>;
