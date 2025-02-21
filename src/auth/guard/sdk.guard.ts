import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Jwt } from '../provider/jwt.provider';

@Injectable()
export class SdkGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtProvider: Jwt,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    try {
      const payload = this.jwtProvider.verify(apiKey);
      const sdk = await this.prismaService.orgManagementSDK.findFirst({
        where: {
          organizationId: payload.organizationId,
        },
        include: {
          organization: true,
        },
      });
      request.organization = sdk.organization;
    } catch (error) {
      Logger.error('Auth Error SDK GUARD', error);
      throw new UnauthorizedException('Invalide Token');
    }
    return true;
  }
}
