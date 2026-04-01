import { z, ZodType } from 'zod';
import {
  UserLoginRequest,
  UserRequest,
  UserUpdateRequest,
} from '../model/user.model';

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
  static readonly LOGIN: ZodType<UserLoginRequest> = z.object({
    username: z
      .string()
      .min(1)
      .regex(/^[A-Z].*$/, {
        message: 'Username must be start with uppercase letter',
      }),
    password: z.string().min(1),
  });
  static readonly UPDATE: ZodType<UserUpdateRequest> = z.object({
    username: z
      .string()
      .min(1)
      .regex(/^[A-Z].*$/, {
        message: 'Username must be start with uppercase letter',
      })
      .optional(),
    password: z.string().min(1).optional(),
    avatar: z.string().min(1).optional(),
  });
}
