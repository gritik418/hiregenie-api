import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names';
import JWTPayload from 'src/modules/auth/types/jwt-payload.type';

declare module 'express' {
  interface Request {
    user?: JWTPayload;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const authToken = request.cookies[AUTH_COOKIE_NAME];

    if (!authToken) throw new UnauthorizedException('Unauthorized.');

    try {
      const verify = this.jwtService.verify(authToken) as JWTPayload | null;

      if (!verify) throw new UnauthorizedException('Unauthorized.');

      if (!verify.email || !verify.id)
        throw new UnauthorizedException('Unauthenticated');

      request.user = verify;

      return true;
    } catch (error) {
      if (error instanceof Error)
        throw new UnauthorizedException('Unauthorized.');
    }

    return false;
  }
}
