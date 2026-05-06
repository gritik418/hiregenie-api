import z from 'zod';
import MatchResumeResponseSchema from '../schemas/matchResumeResponse.schema';

type MatchResumeAnalysisOutputDto = z.infer<typeof MatchResumeResponseSchema>;

export default MatchResumeAnalysisOutputDto;
