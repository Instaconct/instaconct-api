import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/Login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() userRegistrationDto: RegisterDto) {
    return this.authService.register(userRegistrationDto);
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

  @Post('/logout/:refreshToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Param('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
