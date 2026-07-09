import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WSAuthGuard } from 'src/common/guards/auth/ws-auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import { JOIN_INTERVIEW } from '../constants/interview.events';
import { JoinInterviewSchema } from '../schemas/join-interview.schema';
import { NextFunction } from 'express';
import * as cookie from 'cookie';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names';
import { JwtService } from '@nestjs/jwt';
import JoinInterviewDto from '../dto/join-interview.dto';
import { InterviewSessionService } from '../services/interview-session.service';

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: '*',
  },
})
export class InterviewGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly jwtService: JwtService,
    private readonly interviewSessionService: InterviewSessionService,
  ) {}

  afterInit(server: Server) {
    server.use(async (socket: Socket, next: NextFunction) => {
      try {
        const cookies = cookie.parse(socket.handshake.headers.cookie ?? '');

        const token = cookies[AUTH_COOKIE_NAME];

        if (!token) return next(new Error('Unauthorized.'));

        const payload = await this.jwtService.verifyAsync(token);

        socket.user = payload;

        next();
      } catch (error) {
        next(new Error('Unauthorized.'));
      }
    });
  }

  handleConnection(client: Socket) {
    console.log('Connected', client.user);
  }

  handleDisconnect(client: Socket) {
    console.log('Disconnected', client.id);
  }

  @UseGuards(WSAuthGuard)
  @SubscribeMessage(JOIN_INTERVIEW)
  async handleJoinInterview(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ZodValidationPipe(JoinInterviewSchema))
    data: JoinInterviewDto,
  ) {
    return this.interviewSessionService.joinInterview(client, data);
  }
}
