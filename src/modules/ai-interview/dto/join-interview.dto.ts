import z from 'zod';
import { JoinInterviewSchema } from '../schemas/join-interview.schema';

type JoinInterviewDto = z.infer<typeof JoinInterviewSchema>;

export default JoinInterviewDto;
