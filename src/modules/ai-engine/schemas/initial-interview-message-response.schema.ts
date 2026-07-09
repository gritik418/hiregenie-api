import z from 'zod';

const InitialInterviewMessageResponseSchema = z.object({
  message: z.string(),
});

export default InitialInterviewMessageResponseSchema;
