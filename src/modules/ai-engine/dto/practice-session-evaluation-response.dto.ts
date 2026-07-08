import z from 'zod';
import PracticeSessionEvaluationResponseSchema from '../schemas/practice-session-evaluation-response.schema';

type PracticeSessionEvaluationResponseDto = z.infer<
  typeof PracticeSessionEvaluationResponseSchema
>;

export default PracticeSessionEvaluationResponseDto;
