import z from 'zod';
import InitialInterviewMessageResponseSchema from '../schemas/initial-interview-message-response.schema';

type InitialInterviewMessageResponseDto = z.infer<
  typeof InitialInterviewMessageResponseSchema
>;

export default InitialInterviewMessageResponseDto;
