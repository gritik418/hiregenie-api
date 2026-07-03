import z from 'zod';
import ResumeAnalysisResponseSchema from '../schemas/resume-analysis-response.schema';

type ResumeAnalysisResponseDto = z.infer<typeof ResumeAnalysisResponseSchema>;

export default ResumeAnalysisResponseDto;
