import { Socket } from 'socket.io';
import { Jwt } from 'src/auth/provider/jwt.provider';
import { OrganizationService } from 'src/organization/organization.service';
import { UserService } from 'src/user/user.service';
type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
export declare const AuthWsMiddleware: (organizationService: OrganizationService, userService: UserService, jwtProvider: Jwt) => SocketMiddleware;
export {};
