import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from '../../generated/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    //   baca role apa yang dibutuhkan untuk endpoint ini
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // ambil data user dari request
    const { user } = context.switchToHttp().getRequest();
    // 3. Cek apakah role user ada di dalam daftar role yang diizinkan
    return requiredRoles.some((role) => user.role === role);
  }
}
