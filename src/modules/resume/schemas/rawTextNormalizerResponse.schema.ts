import z from 'zod';

const RawTextNormalizerResponseSchema = z.object({
  normalizedText: z.string().default('').optional(),
});

export default RawTextNormalizerResponseSchema;
