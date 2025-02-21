import { Socket } from 'socket.io';
import { Jwt } from 'src/auth/provider/jwt.provider';
import { OrganizationService } from 'src/organization/organization.service';
import { UserService } from 'src/user/user.service';

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const AuthWsMiddleware = (
  organizationService: OrganizationService,
  userService: UserService,
  jwtProvider: Jwt,
): SocketMiddleware => {
  return async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake?.auth?.token || socket.handshake?.headers['x-api-key'];

      if (!token) {
        throw new Error('Unauthorized');
      }

      const payload = jwtProvider.verify(token);

      if (!payload) {
        throw new Error('Unauthorized');
      }

      if (payload.sdkType) {
        const organization = await organizationService.findOne(
          payload.organizationId,
        );

        if (!organization) {
          throw new Error('Unauthorized');
        }
        socket.data.organization = organization;
        socket.data.organizationId = organization.id;
      } else {
        const user = await userService.findOneById(payload.id);
        if (!user) {
          throw new Error('Unauthorized');
        }
        socket.data.user = user;
        socket.data.organizationId = user.organizationId;
      }

      next();
    } catch (error) {
      console.error(error);
      next(new Error('Unauthorized'));
    }
  };
};
