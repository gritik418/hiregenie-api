import z from 'zod';
import CreateInterviewSessionSchema from '../schemas/create-interview-session.schema';

type CreateInterviewSessionDto = z.infer<typeof CreateInterviewSessionSchema>;

export default CreateInterviewSessionDto;
