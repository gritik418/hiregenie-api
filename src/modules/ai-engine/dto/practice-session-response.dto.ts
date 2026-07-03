import z from 'zod';
import PracticeSessionResponseSchema from '../schemas/practice-session-response.schema';

type PracticeSessionResponseDto = z.infer<typeof PracticeSessionResponseSchema>;

export default PracticeSessionResponseDto;
