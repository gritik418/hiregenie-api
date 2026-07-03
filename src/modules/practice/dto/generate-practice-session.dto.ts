import z from 'zod';
import GeneratePracticeSessionSchema from '../schemas/generate-practice-session.schema';

type GeneratePracticeSessionInputDto = z.infer<
  typeof GeneratePracticeSessionSchema
>;

export default GeneratePracticeSessionInputDto;
