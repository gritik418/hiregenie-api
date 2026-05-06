import z from 'zod';
import MatchResumeSchema from '../schemas/matchResume.schema';

type MatchResumeInputDto = z.infer<typeof MatchResumeSchema>;

export default MatchResumeInputDto;
