import z from 'zod';
import MatchResumeResponseSchema from '../schemas/match-resume-response.schema';

type MatchResumeResponseDto = z.infer<typeof MatchResumeResponseSchema>;

export default MatchResumeResponseDto;
