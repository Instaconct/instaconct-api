import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthenticationGuard } from 'src/auth/guard/authentication.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { Role, User } from '@prisma/client';
import { GetUser } from 'src/shared/decorator/user.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('analytics')
@UseInterceptors(CacheInterceptor)
@UseGuards(AuthenticationGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('ticket-statistics')
  @Roles(Role.MANAGER, Role.SUPER_MANAGER)
  getTicketStatistics(@Query('range') range: string, @GetUser() user: User) {
    return this.analyticsService.fetchTicketStatistics(
      range,
      user.organizationId,
    );
  }

  @Get('agent/performance')
  @Roles(Role.AGENT)
  getAgentPerformance(@Query('range') range: string, @GetUser() user: User) {
    return this.analyticsService.fetchAgentPerformance(user.id, range);
  }
}
