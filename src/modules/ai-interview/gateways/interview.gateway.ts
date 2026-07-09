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

import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';
import { NextFunction } from 'express';
import { Server, Socket } from 'socket.io';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names';
import { WsExceptionFilter } from 'src/common/filters/ws-exception/ws-exception.filter';
import { WSAuthGuard } from 'src/common/guards/auth/ws-auth.guard';
import { WsZodValidationPipe } from 'src/common/pipes/ws-zod-validation/ws-zod-validation.pipe';
import { InterviewEvents } from '../constants/interview.events';
import HandleAnswerDto from '../dto/handle-answer.dto';
import JoinInterviewDto from '../dto/join-interview.dto';
import { HandleAnswerSchema } from '../schemas/handle-answer.schema';
import { JoinInterviewSchema } from '../schemas/join-interview.schema';
import { InterviewSessionService } from '../services/interview-session.service';

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: '*',
  },
})
@UseFilters(new WsExceptionFilter())
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
  @SubscribeMessage(InterviewEvents.JOIN)
  async handleJoinInterview(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsZodValidationPipe(JoinInterviewSchema))
    data: JoinInterviewDto,
  ) {
    return this.interviewSessionService.joinInterview(client, data);
  }

  @UseGuards(WSAuthGuard)
  @SubscribeMessage(InterviewEvents.ANSWER)
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsZodValidationPipe(HandleAnswerSchema))
    data: HandleAnswerDto,
  ) {
    return this.interviewSessionService.handleAnswer(client, data);
  }
}
