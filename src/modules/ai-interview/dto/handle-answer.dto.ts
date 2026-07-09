import z from 'zod';
import { HandleAnswerSchema } from '../schemas/handle-answer.schema';

type HandleAnswerDto = z.infer<typeof HandleAnswerSchema>;

export default HandleAnswerDto;
