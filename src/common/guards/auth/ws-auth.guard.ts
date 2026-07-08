import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import JWTPayload from 'src/modules/auth/types/jwt-payload.type';
import * as cookie from 'cookie';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names';

declare module 'socket.io' {
  interface Socket {
    user: JWTPayload;
  }
}

@Injectable()
export class WSAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    const cookies = cookie.parse(client.handshake.headers.cookie ?? '');

    const authToken = cookies[AUTH_COOKIE_NAME];

    if (!authToken) throw new UnauthorizedException('Unauthorized.');
    console.log('first', authToken);
    try {
      const payload = this.jwtService.verify<JWTPayload>(authToken);

      if (!payload.email || !payload.id)
        throw new UnauthorizedException('Invalid token.');

      client.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
