import z from 'zod';
import SaveAnswerSchema from '../schemas/save-answer.schema';

type SaveAnswerInputDto = z.infer<typeof SaveAnswerSchema>;

export default SaveAnswerInputDto;
