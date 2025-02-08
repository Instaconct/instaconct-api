import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Jwt } from '../provider/jwt.provider';
import { UserService } from 'src/user/user.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private userService: UserService;

  constructor(
    private readonly jwtService: Jwt,
    private moduleRef: ModuleRef,
  ) {}

  private getUserService(): UserService {
    if (!this.userService) {
      this.userService = this.moduleRef.get(UserService, { strict: false });
    }
    return this.userService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userService = this.getUserService();
      const user = await userService.findOneById(payload.id);
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
