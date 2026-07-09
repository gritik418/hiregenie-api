import z from 'zod';

const JoinInterviewSchema = z.object({
  sessionId: z.string({ required_error: 'Session ID is required' }).trim(),
});

export { JoinInterviewSchema };
