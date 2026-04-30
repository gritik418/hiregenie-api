import z from 'zod';
import registerSchema from '../schemas/register.schema';

type RegisterInputDto = z.infer<typeof registerSchema>;

export default RegisterInputDto;
