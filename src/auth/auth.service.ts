import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Jwt } from './provider/jwt.provider';
import { IJwtPayload } from './interface/jwt-payload.interface';
import { Role } from '@prisma/client';
import { Hash } from './provider/hash.provider';
import { IRefreshPayload } from './interface/refresh-payload.interface';
import { RefreshDto } from './dto/refresh.dto';
import { MailService } from 'src/mail/mail.service';
import { EMAIL_TYPES } from 'src/mail/email.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtProvider: Jwt,
    private readonly hashProvider: Hash,
    private readonly mailService: MailService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async register(userRegistrationDto: RegisterDto) {
    try {
      const checkEmail = await this.prismaService.user.findUnique({
        where: { email: userRegistrationDto.email },
      });

      if (checkEmail) {
        throw new ConflictException('Email already exists');
      }

      const organization = await this.prismaService.organization.create({
        data: userRegistrationDto.organization,
      });

      userRegistrationDto.role = Role.SUPER_MANGER;
      userRegistrationDto.password = await this.hashProvider.hashPassword(
        userRegistrationDto.password,
      );

      const emailVerifyToken = await this.hashProvider.generateRandomString();
      const user = await this.prismaService.user.create({
        data: {
          name: userRegistrationDto.name,
          email: userRegistrationDto.email,
          password: userRegistrationDto.password,
          organizationId: organization.id,
          role: userRegistrationDto.role,
          token: emailVerifyToken,
          phone: userRegistrationDto.phone,
        },
        include: { organization: true },
      });

      const payload: IJwtPayload = {
        id: user.id,
        email: user.email,
      };

      const accessToken = this.jwtProvider.generateAccessToken(payload);
      const refreshPayload: IRefreshPayload = {
        signature: accessToken.split('.')[2],
      };

      const refreshToken = await this.jwtProvider.generateRefreshToken(
        user.email,
        refreshPayload,
      );

      await this.mailService.sendEmail(
        user.email,
        'Account Created , Please Activate Your Email',
        { url: process.env.DEFAULT_VERIFY_URL + `?token=${emailVerifyToken}` },
        EMAIL_TYPES.CONFIRM_EMAIL,
      );

      return { accessToken, refreshToken, user };
    } catch (error) {
      this.logger.error("Couldn't register", error);
      if (error instanceof ConflictException) {
        throw error;
      }

      // prisma unique constraint error
      if (error.code === 'P2002') {
        throw new ConflictException('Organization name already exists');
      }
      throw new InternalServerErrorException();
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { token },
      });

      if (!user) {
        throw new NotFoundException('Invalid token');
      }

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { token: null, is_verified: true },
      });

      return user;
    } catch (error) {
      this.logger.error("Couldn't verify email", error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException();
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async login(email: string, plainPassword: string) {
    try {
      const { password, ...user } = await this.prismaService.user.findUnique({
        where: { email },
        include: { organization: true },
        omit: { password: false },
      });

      if (!user) {
        throw new ConflictException('Invalid credentials');
      }

      const isPasswordValid = await this.hashProvider.comparePassword(
        plainPassword,
        password,
      );

      if (!isPasswordValid) {
        throw new ConflictException('Invalid credentials');
      }

      const payload: IJwtPayload = {
        id: user.id,
        email: user.email,
      };

      const accessToken = this.jwtProvider.generateAccessToken(payload);

      const refreshPayload: IRefreshPayload = {
        signature: accessToken.split('.')[2],
      };

      const refreshToken = await this.jwtProvider.generateRefreshToken(
        user.email,
        refreshPayload,
      );

      return { accessToken, refreshToken, user };
    } catch (error) {
      this.logger.error("Couldn't login", error);
      throw new InternalServerErrorException();
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async refresh(refreshDto: RefreshDto) {
    try {
      const { accessToken, refreshToken } = refreshDto;
      const verifiedPayload = await this.jwtProvider.verifyRefreshToken(
        refreshToken,
        accessToken,
      );

      if (!verifiedPayload) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prismaService.user.findUnique({
        where: { email: verifiedPayload },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload: IJwtPayload = {
        id: user.id,
        email: user.email,
      };

      const newAccessToken = this.jwtProvider.generateAccessToken(payload);

      const refreshPayload: IRefreshPayload = {
        signature: newAccessToken.split('.')[2],
      };

      const newRefreshToken = await this.jwtProvider.generateRefreshToken(
        user.email,
        refreshPayload,
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.logger.error("Couldn't refresh token", error);
      throw error;
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async logout(refreshToken: string) {
    try {
      const success = await this.jwtProvider.revokeRefreshToken(refreshToken);
      if (success) this.logger.log('Refresh token revoked');
      else this.logger.error('Failed to revoke refresh token');
    } catch (error) {
      this.logger.error("Couldn't revoke refresh token", error);
      throw new InternalServerErrorException();
    }
  }
}
