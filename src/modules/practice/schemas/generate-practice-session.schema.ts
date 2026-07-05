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
  estimatedDuration: z
    .string()
    .default('30 minutes')
    .optional()
    .refine((val) => {
      if (!val) return true;
      const parts = val.split(' ');
      if (parts.length !== 2) return false;
      const [amount, unit] = parts;
      const numAmount = parseInt(amount, 10);
      if (isNaN(numAmount)) return false;
      return (
        (unit.toLowerCase() === 'minutes' || unit.toLowerCase() === 'minute') &&
        numAmount > 0
      );
    }, 'Please enter a valid duration (e.g. 30 minutes or 1 minute).'),
  customInstructions: z.string().optional(),
});

export default GeneratePracticeSessionSchema;
