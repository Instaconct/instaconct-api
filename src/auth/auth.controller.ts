import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Get,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/Login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { GetUser } from 'src/shared/decorator/user.decorator';
import { User } from '@prisma/client';
import { AuthenticationGuard } from './guard/authentication.guard';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { RestPasswordDto } from './dto/rest-password.dto';
import { SdkAuthDto } from './dto/sdk-auth.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() userRegistrationDto: RegisterDto) {
    return this.authService.register(userRegistrationDto);
  }

  @Post('/sdk')
  async createSDK(
    @Body() sdkAuthDto: SdkAuthDto,
    @Headers('x-api-key') apiKey: string,
  ) {
    return this.authService.authenticateSdk(sdkAuthDto, apiKey);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() userLoginDto: LoginDto) {
    return this.authService.login(userLoginDto.email, userLoginDto.password);
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
  }

  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgotPassword(forgetPasswordDto.email);
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() restPasswordDto: RestPasswordDto) {
    return this.authService.resetPassword(
      restPasswordDto.token,
      restPasswordDto.newPassword,
    );
  }

  @Post('/verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyToken(verifyTokenDto.token);
  }

  @Post('/verify/:token')
  @HttpCode(HttpStatus.OK)
  async verify(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('/logout/:refreshToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Param('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Get('/me')
  @UseGuards(AuthenticationGuard)
  async me(@GetUser() user: User) {
    return user;
  }
}
