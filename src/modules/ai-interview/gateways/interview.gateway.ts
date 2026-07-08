import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
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

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: '*',
  },
})
export class InterviewGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Connected', client.user);
  }

  handleDisconnect(client: Socket) {
    console.log('Disconnected', client.id);
  }

  @SubscribeMessage('ping')
  @UseGuards(WSAuthGuard)
  handlePing(@ConnectedSocket() client: Socket) {
    console.log('Ping', client.user);
  }

  @UseGuards(WSAuthGuard)
  @SubscribeMessage(JOIN_INTERVIEW)
  handleJoinInterview(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ZodValidationPipe(JoinInterviewSchema)) data: unknown,
  ) {
    console.log('Client joined', client.id);
  }
}
