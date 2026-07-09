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
import { WsException } from '@nestjs/websockets';

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

    if (!authToken)
      throw new WsException({
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to join this session',
      });

    try {
      const payload = this.jwtService.verify<JWTPayload>(authToken);

      if (!payload.email || !payload.id)
        throw new WsException({
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        });

      client.user = payload;

      return true;
    } catch {
      throw new WsException({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      });
    }
  }
}
