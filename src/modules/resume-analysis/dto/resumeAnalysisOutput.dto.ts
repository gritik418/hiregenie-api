import z from 'zod';
import ResumeAnalysisResponseSchema from '../schemas/resumeAnalysisResponse.schema';

type ResumeAnalysisOutputDto = z.infer<typeof ResumeAnalysisResponseSchema>;

export default ResumeAnalysisOutputDto;
