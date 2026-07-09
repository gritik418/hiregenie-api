import z from 'zod';

const InterviewMessageResponseSchema = z.object({
  message: z.string(),
});

export default InterviewMessageResponseSchema;
