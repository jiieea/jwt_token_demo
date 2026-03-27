import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeaders(request);
    if (!token) {
      throw new UnauthorizedException('Token not Valid');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'publicstaticvoid_12',
      });

      const checkToken = await this.prismaService.uSER.findUnique({
        where: { username: payload.username },
      });

      if (!checkToken || checkToken.token !== token) {
        throw new UnauthorizedException('Session telah selesai');
      }
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token not found');
    }
    return true;
  }

  private getTokenFromHeaders(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
