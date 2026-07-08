import z from 'zod';

const SaveAnswerSchema = z.object({
  answer: z.string().min(1, 'Answer is required.'),
});

export default SaveAnswerSchema;
