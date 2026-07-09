import z from 'zod';

const HandleAnswerSchema = z.object({
  sessionId: z.string({ required_error: 'Session ID is required' }).trim(),
  answer: z.string({ required_error: 'Answer is required' }).trim().min(1, 'Answer cannot be empty'),
});

export { HandleAnswerSchema };
