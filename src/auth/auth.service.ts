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
import { Role, SDKType } from '@prisma/client';
import { Hash } from './provider/hash.provider';
import { IRefreshPayload } from './interface/refresh-payload.interface';
import { RefreshDto } from './dto/refresh.dto';
import { MailService } from 'src/mail/mail.service';
import { EMAIL_TYPES } from 'src/mail/email.types';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SdkAuthDto } from './dto/sdk-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtProvider: Jwt,
    private readonly hashProvider: Hash,
    private readonly mailService: MailService,
    @InjectQueue('org-sdk') private readonly orgSdkQueue: Queue,
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

      userRegistrationDto.role = Role.SUPER_MANAGER;
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

      await this.orgSdkQueue.add('create-sdk', {
        organizationId: organization.id,
        sdkType: SDKType.WEB,
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
        {
          url:
            process.env.DEFAULT_VERIFY_URL +
            process.env.VERIFICATION_MAIL_URL +
            `?token=${emailVerifyToken}`,
        },
        EMAIL_TYPES.CONFIRM_EMAIL,
      );

      return { accessToken, refreshToken, user };
    } catch (error) {
      this.logger.error('Registration failed', {
        error,
        details: error.message,
      });

      // Clean up organization if it was created
      if (error.meta?.target !== 'Organization_name_key') {
        try {
          await this.prismaService.organization.delete({
            where: { name: userRegistrationDto.organization.name },
          });
        } catch (deleteError) {
          this.logger.error(
            'Failed to clean up organization during error handling',
            {
              error: deleteError,
              organizationName: userRegistrationDto.organization.name,
            },
          );
        }
      }

      // Handle known error cases
      if (error instanceof ConflictException) {
        throw error;
      }

      // Handle Prisma unique constraint violations
      const uniqueConstraintErrors = {
        Organization_name_key: 'Organization name already exists',
        User_phone_key: 'Phone number already exists',
        User_email_key: 'Email already exists',
      };

      const constraintError = uniqueConstraintErrors[error.meta?.target];
      if (constraintError) {
        throw new ConflictException(constraintError);
      }

      // Log unexpected errors with more detail
      this.logger.error('Unexpected error during registration', {
        error,
        stack: error.stack,
        context: {
          email: userRegistrationDto.email,
          organizationName: userRegistrationDto.organization.name,
        },
      });

      throw new InternalServerErrorException(
        'Registration failed due to an unexpected error',
      );
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
        data: { token: null, is_verified: true, token_expires_at: null },
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
      const user = await this.prismaService.user.findUnique({
        where: { email },
        include: { organization: true },
        omit: { password: false },
      });

      if (!user) {
        throw new ConflictException('Invalid credentials');
      }

      const password = user.password;

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

      delete user.password;

      return { accessToken, refreshToken, user };
    } catch (error) {
      this.logger.error("Couldn't login", error);
      throw error; // throw error to be caught by global exception filter
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new ConflictException('User not found');
      }

      if (user.is_verified === false) {
        throw new ConflictException('User not verified');
      }

      if (user.token_expires_at && user.token_expires_at > new Date()) {
        throw new ConflictException('Token already exists');
      }

      const passwordResetToken = await this.hashProvider.generateRandomString();

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          token: passwordResetToken,
          token_expires_at: new Date(Date.now() + 1000 * 60 * 15),
        },
      });

      await this.mailService.sendEmail(
        user.email,
        'Password Reset Request',
        {
          url: process.env.DEFAULT_VERIFY_URL + `?token=${passwordResetToken}`,
        },
        EMAIL_TYPES.RESET_PASSWORD,
      );

      return { message: 'Password reset email sent' };
    } catch (error) {
      this.logger.error("Couldn't forgot password", error);
      return { message: 'Password reset email sent' };
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { token: token },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid Token');
      }

      if (user.token_expires_at < new Date()) {
        throw new UnauthorizedException('Token expired');
      }

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          password: await this.hashProvider.hashPassword(newPassword),
          token: null,
          token_expires_at: null,
        },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      this.logger.error("Couldn't reset password", error);
      throw error;
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async verifyToken(token: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { token },
      });

      if (!user) {
        throw new ConflictException('Invalid credentials');
      }

      if (user.token_expires_at < new Date()) {
        throw new ConflictException('Token expired');
      }

      return user;
    } catch (error) {
      this.logger.error("Couldn't verify token", error);
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

  async authenticateSdk(sdkAuthDto: SdkAuthDto, public_key: string) {
    try {
      if (!sdkAuthDto.private_key) {
        throw new UnauthorizedException('Invalid SDK credentials');
      }

      if (!public_key) {
        throw new UnauthorizedException('Invalid SDK credentials');
      }

      const sdk = await this.prismaService.orgManagementSDK.findFirst({
        where: {
          public_key: public_key,
          private_key: sdkAuthDto.private_key,
        },
        include: {
          organization: true,
        },
      });

      if (!sdk) {
        throw new UnauthorizedException('Invalid SDK credentials');
      }

      const token = await this.jwtProvider.generateSdkToken(
        sdk.organizationId,
        SDKType.WEB,
      );

      return { token, organizationId: sdk.organizationId };
    } catch (error) {
      this.logger.error("Couldn't authenticate SDK", error);
      throw error;
    }
  }
}
