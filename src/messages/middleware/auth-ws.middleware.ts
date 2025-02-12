import { Socket } from 'socket.io';
import { OrganizationService } from 'src/organization/organization.service';

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const AuthWsMiddleware = (
  organizationService: OrganizationService,
): SocketMiddleware => {
  return async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake?.auth?.token || socket.handshake?.headers['token'];

      if (!token) {
        throw new Error('Unauthorized');
      }

      const organization = await organizationService.findOne(token, null);

      if (!organization) {
        throw new Error('Unauthorized');
      }
      socket.data.organization = organization;
      next();
    } catch (error) {
      console.error(error);
      next(new Error('Unauthorized'));
    }
  };
};
