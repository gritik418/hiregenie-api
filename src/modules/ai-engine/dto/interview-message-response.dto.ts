import z from 'zod';
import InterviewMessageResponseSchema from '../schemas/interview-message-response.schema';

type InterviewMessageResponseDto = z.infer<
  typeof InterviewMessageResponseSchema
>;

export default InterviewMessageResponseDto;
