import { Difficulty, InterviewType } from 'generated/prisma/enums';
import z from 'zod';

const CreateInterviewSessionSchema = z.object({
  targetRole: z.string(),
  resumeId: z.string(),
  difficulty: z
    .nativeEnum(Difficulty, {
      errorMap: () => ({ message: 'Invalid difficulty level.' }),
    })
    .optional()
    .default(Difficulty.MEDIUM),
  interviewType: z
    .nativeEnum(InterviewType, {
      errorMap: () => ({ message: 'Invalid interview type.' }),
    })
    .optional()
    .default(InterviewType.MIXED),
});

export default CreateInterviewSessionSchema;
