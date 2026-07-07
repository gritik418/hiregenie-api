import { Difficulty } from 'generated/prisma/client';
import z from 'zod';

const GeneratePracticeSessionSchema = z.object({
  targetRole: z.string().min(1, 'Please enter a valid role.'),
  difficulty: z
    .nativeEnum(Difficulty, {
      errorMap: () => ({ message: 'Please select a valid difficulty level.' }),
    })
    .default(Difficulty.MEDIUM),
  questionCount: z
    .number()
    .positive('Please enter a valid question count.')
    .max(20, 'Please enter a valid question count.')
    .optional()
    .default(5),
  customInstructions: z.string().optional(),
});

export default GeneratePracticeSessionSchema;
