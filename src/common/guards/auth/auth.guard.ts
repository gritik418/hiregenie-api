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
    const request = context.switchToHttp().getRequest<Request>();

    const authToken = request.cookies?.[AUTH_COOKIE_NAME];

    if (!authToken) throw new UnauthorizedException('Unauthorized.');

    try {
      const payload = this.jwtService.verify<JWTPayload>(authToken);

      if (!payload.email || !payload.id)
        throw new UnauthorizedException('Invalid token.');

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
