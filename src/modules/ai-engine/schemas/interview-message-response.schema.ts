import z from 'zod';

const InterviewMessageResponseSchema = z.object({
  message: z.string(),
  isLastMessage: z.boolean(),
});

export default InterviewMessageResponseSchema;
