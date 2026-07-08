import { z } from 'zod';

const JoinInterviewSchema = z.object({
  userId: z
    .string({ required_error: 'User ID is required' })
    .trim()
    .uuid('User ID must be a valid UUID'),
  resumeId: z
    .string({ required_error: 'Resume ID is required' })
    .trim()
    .uuid('Resume ID must be a valid UUID'),
});

export { JoinInterviewSchema };
