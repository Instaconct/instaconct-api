import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service';
import { AuthenticationGuard } from 'src/auth/guard/authentication.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { MetaPlatform, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';

@Controller('meta')
export class MetaController {
  constructor(
    private metaService: MetaService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.SUPER_MANAGER)
  @Get('connect')
  async connectMeta(@Req() req, @Res() res: Response) {
    const user = req.user ?? {
      id: '01JP2TB8ZCRMTM9322HTNQXFJH',
      name: 'string1',
      email: 'omarsabra509@test.com',
      phone: '+201024638614',
      organizationId: '01JP2TB8YTGY9P5ENX22CGXPKX',
      is_verified: false,
      created_at: '2025-03-11T14:39:40.012Z',
      updated_at: '2025-03-11T14:39:40.012Z',
      role: 'SUPER_MANAGER',
    };
    const state = crypto.randomUUID();

    await this.prismaService.metaAuthState.create({
      data: {
        state,
        userId: user.id,
        organizationId: user.organizationId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    const redirectUri = this.configService.get<string>('META_REDIRECT_URI');
    console.log(redirectUri);
    const authUrl = this.metaService.getAuthorizationUrl(redirectUri, state);

    return res.redirect(authUrl);
  }

  @Get('callback')
  async metaCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const frontEndUrl = this.configService.get<string>('FRONTEND_URL');

    try {
      // Verify state to prevent CSRF attacks
      const authState = await this.prismaService.metaAuthState.findUnique({
        where: { state },
      });

      if (!authState || new Date() > authState.expiresAt) {
        return res.redirect('/auth/error?message=Invalid or expired state');
      }

      // Exchange code for short-lived token
      const redirectUri = this.configService.get<string>('META_REDIRECT_URI');
      const tokenData = await this.metaService.exchangeCodeForToken(
        code,
        redirectUri,
      );

      // Exchange short-lived token for long-lived token
      const longLivedTokenData = await this.metaService.getLongLivedToken(
        tokenData.access_token,
      );

      // Get user's pages
      const pages = await this.metaService.getUserPages(
        longLivedTokenData.access_token,
      );

      // Store user's Meta connection and pages
      await this.prismaService.metaConnection.create({
        data: {
          organizationId: authState.organizationId,
          platform: MetaPlatform.FACEBOOK,
          accessToken: longLivedTokenData.access_token,
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          userId: authState.userId,
        },
      });

      // Store each page connection
      for (const page of pages) {
        const pageAccessToken = await this.metaService.getPageAccessToken(
          longLivedTokenData.access_token,
          page.id,
        );

        await this.prismaService.metaPageConnection.create({
          data: {
            organizationId: authState.organizationId,
            platform: MetaPlatform.FACEBOOK,
            pageId: page.id,
            pageName: page.name,
            accessToken: pageAccessToken,
          },
        });
      }

      // Clean up the auth state
      await this.prismaService.metaAuthState.delete({
        where: { state },
      });

      if (!frontEndUrl) {
        return res.redirect('/dashboard/integrations?success=true');
      }

      return res.redirect(`${frontEndUrl}/dashboard/integrations?success=true`);
    } catch (error) {
      console.error('Meta callback error:', error);
      return res.redirect(
        `${frontEndUrl}/auth/error?message=Failed to connect Meta account`,
      );
    }
  }
}
