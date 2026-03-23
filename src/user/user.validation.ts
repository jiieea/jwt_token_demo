import { z, ZodType } from 'zod';
import { UserRequest } from '../model/user.model';

export class UserValidation {
  static readonly REGISTER: ZodType<UserRequest> = z.object({
    username: z
      .string()
      .min(1)
      .regex(/^[A-Z].*$/, {
        message: 'Username must be start with uppercase letter',
      }),
    password: z.string().min(1),
  });
}
