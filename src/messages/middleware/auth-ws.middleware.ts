import { Socket } from 'socket.io';
import { Jwt } from 'src/auth/provider/jwt.provider';
import { TicketService } from 'src/ticket/ticket.service';

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const AuthWsMiddleware = (
  ticketService: TicketService,
  jwtProvider: Jwt,
): SocketMiddleware => {
  return async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake?.auth?.token || socket.handshake?.headers['token'];

      if (!token) {
        throw new Error('Unauthorized');
      }

      const payload = jwtProvider.verify(token);

      if (!payload) {
        throw new Error('Unauthorized');
      }

      if (payload.ticketId) {
        const ticket = await ticketService.findOne(payload.ticketId);
        if (!ticket) {
          throw new Error('Unauthorized');
        }
        socket.data.ticketId = payload.ticketId;
      }

      next();
    } catch (error) {
      console.error(error);
      next(new Error('Unauthorized'));
    }
  };
};
