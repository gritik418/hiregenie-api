import { Difficulty } from 'generated/prisma/client';
import z from 'zod';

const GeneratePracticeSessionSchema = z.object({
  targetRole: z.string().min(1, 'Please enter a valid role.'),
  difficulty: z.nativeEnum(Difficulty, {
    errorMap: () => ({ message: 'Please select a valid difficulty level.' }),
  }),
});

export default GeneratePracticeSessionSchema;
