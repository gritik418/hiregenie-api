import z from 'zod';
import AiResumeSummaryResponseSchema from '../schemas/aiResumeSummaryResponse.schema';

type AiResumeSummaryOutputDto = z.infer<typeof AiResumeSummaryResponseSchema>;

export default AiResumeSummaryOutputDto;
