import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../interface/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { IRefreshPayload } from '../interface/refresh-payload.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class Jwt {
  readonly EXPIRE_TIME_REFRESH = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  generateAccessToken(payload: IJwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_EXPIRATION_TIME'),
    });
  }

  async generateRefreshToken(email: string, payload: IRefreshPayload) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION_TIME'),
    });

    await this.cacheManager.set(refreshToken, email, this.EXPIRE_TIME_REFRESH);

    return refreshToken;
  }

  verify(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
    });
  }

  verifyAsync(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
    });
  }

  /**
   * Verifies the refresh token against the access token and cached data.
   * @param refreshToken - The refresh token to verify
   * @param accessToken - The access token to verify against
   * @returns The email associated with the tokens if verification succeeds, false otherwise
   * @throws {JsonWebTokenError} If the refresh token is invalid or expired
   */
  async verifyRefreshToken(refreshToken: string, accessToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    });

    if (payload.signature !== accessToken.split('.')[2]) {
      console.error('Invalid signature');
      return false;
    }

    const refreshValue = await this.cacheManager.get(refreshToken);

    const { email }: IJwtPayload = this.jwtService.decode(
      accessToken,
    ) as IJwtPayload;

    if (refreshValue !== email) {
      console.error('Invalid email');
      return false;
    }

    await this.cacheManager.del(refreshToken);

    return email;
  }

  public getRefreshPayload(refreshToken: string): Promise<IRefreshPayload> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      return payload;
    } catch (error) {
      throw error;
    }
  }

  public async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    return await this.cacheManager.del(refreshToken);
  }

  async generateTicketToken(conversationId: string) {
    return this.jwtService.sign(
      { conversationId },
      {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: '1h',
      },
    );
  }
}
