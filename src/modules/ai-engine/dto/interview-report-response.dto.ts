import z from 'zod';
import InterviewReportResponseSchema from '../schemas/interview-report-response.schema';

type InterviewReportResponseDto = z.infer<typeof InterviewReportResponseSchema>;

export default InterviewReportResponseDto;
