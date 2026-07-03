import z from 'zod';
import { AISummaryResponseSchema } from '../schemas/ai-summary-response.schema';

type AISummaryResponseDto = z.infer<typeof AISummaryResponseSchema>;

export default AISummaryResponseDto;
