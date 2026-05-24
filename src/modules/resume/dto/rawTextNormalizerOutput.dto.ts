import z from 'zod';
import RawTextNormalizerResponseSchema from '../schemas/rawTextNormalizerResponse.schema';

type RawTextNormalizerOutputDto = z.infer<
  typeof RawTextNormalizerResponseSchema
>;

export default RawTextNormalizerOutputDto;
