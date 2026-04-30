import z from 'zod';
import loginSchema from '../schemas/login.schema';

type LoginInputDto = z.infer<typeof loginSchema>;

export default LoginInputDto;
