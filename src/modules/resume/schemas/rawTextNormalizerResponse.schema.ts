import z from 'zod';

const RawTextNormalizerResponseSchema = z.object({
  normalizedText: z.string().optional().nullable().default(''),
});

export default RawTextNormalizerResponseSchema;
