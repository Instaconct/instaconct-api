import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prismaService: PrismaService) {}

  async fetchTicketStatistics(timeRange: string, organizationId: string) {
    console.log('Fetching ticket statistics...'); // Debug log
    if (!['day', 'week', 'month'].includes(timeRange) || !timeRange) {
      throw new BadRequestException('Invalid time range specified');
    }

    const now = new Date();
    const startDate = this.getStartDate(now, timeRange);

    const tickets = await this.prismaService.ticket.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        closedAt: true,
        status: true,
        source: true,
      },
    });

    const statusCounts = {
      open: 0,
      closed: 0,
      assigned: 0,
    };

    tickets.forEach((ticket) => {
      if (ticket.status === 'OPEN') statusCounts.open++;
      else if (ticket.status === 'CLOSED') statusCounts.closed++;
      else if (ticket.status === 'ASSIGNED') statusCounts.assigned++;
    });

    const totalTickets = tickets.length;
    const {
      open: openTickets,
      closed: closedTickets,
      assigned: assignedTickets,
    } = statusCounts;

    const avgResolutionTimeMinutes = this.calculateAvgResolutionTime(tickets);
    const resolutionTimeByInterval = this.calculateResolutionTimeByInterval(
      tickets,
      timeRange,
    );

    const ticketsBySource = this.groupTicketsBySource(tickets);
    const ticketsByTime = this.groupTicketsByTimeInterval(tickets, timeRange);

    const percentages = totalTickets
      ? [
          Math.round((openTickets / totalTickets) * 100),
          Math.round((closedTickets / totalTickets) * 100),
          Math.round((assignedTickets / totalTickets) * 100),
        ]
      : [0, 0, 0];

    return {
      timeRange,
      period: {
        start: startDate,
        end: now,
      },
      summary: {
        totalTickets,
        openTickets,
        closedTickets,
        assignedTickets,
        avgResolutionTimeMinutes,
      },
      lineChartData: {
        labels: ticketsByTime.map((t) => t.timeInterval),
        datasets: [
          {
            label: 'Total Tickets',
            data: ticketsByTime.map((t) => t.totalTickets),
          },
          {
            label: 'Open Tickets',
            data: ticketsByTime.map((t) => t.openTickets),
          },
          {
            label: 'Closed Tickets',
            data: ticketsByTime.map((t) => t.closedTickets),
          },
          {
            label: 'Assigned Tickets',
            data: ticketsByTime.map((t) => t.assignedTickets),
          },
        ],
      },
      statusDistribution: {
        labels: ['Open', 'Closed', 'Assigned'],
        datasets: [
          {
            data: [openTickets, closedTickets, assignedTickets],
            percentages,
          },
        ],
      },
      resolutionTimeChart: {
        labels: resolutionTimeByInterval.map((item) => item.timeInterval),
        datasets: [
          {
            label: 'Average Resolution Time (minutes)',
            data: resolutionTimeByInterval.map(
              (item) => item.avgResolutionMinutes,
            ),
          },
        ],
      },
      ticketsByTime,
      ticketsBySource,
    };
  }

  private getStartDate(now: Date, timeRange: string): Date {
    const startDate = new Date(now);

    switch (timeRange) {
      case 'day':
        startDate.setHours(now.getHours() - 24);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    return startDate;
  }

  private calculateAvgResolutionTime(
    tickets: Array<{ createdAt: Date; closedAt: Date | null; status: string }>,
  ): number | null {
    const closedTicketsWithTime = tickets.filter(
      (t) => t.status === 'CLOSED' && t.closedAt,
    );

    if (closedTicketsWithTime.length === 0) {
      return null;
    }

    const totalMinutes = closedTicketsWithTime.reduce((sum, ticket) => {
      const createdTime = new Date(ticket.createdAt).getTime();
      const closedTime = new Date(ticket.closedAt!).getTime();
      return sum + (closedTime - createdTime) / (1000 * 60);
    }, 0);

    return Math.round(totalMinutes / closedTicketsWithTime.length);
  }

  private calculateResolutionTimeByInterval(
    tickets: Array<{ createdAt: Date; closedAt: Date | null; status: string }>,
    timeRange: string,
  ) {
    const intervalMap: Record<
      string,
      {
        timeInterval: string;
        totalResolutionMinutes: number;
        ticketCount: number;
        avgResolutionMinutes: number | null;
      }
    > = {};

    // Filter closed tickets with resolution time
    const closedTickets = tickets.filter(
      (t) => t.status === 'CLOSED' && t.closedAt,
    );

    closedTickets.forEach((ticket) => {
      const createdDate = new Date(ticket.createdAt);
      let intervalKey: string;

      if (timeRange === 'day') {
        const year = createdDate.getFullYear();
        const month = String(createdDate.getMonth() + 1).padStart(2, '0');
        const day = String(createdDate.getDate()).padStart(2, '0');
        const hour = String(createdDate.getHours()).padStart(2, '0');
        intervalKey = `${year}-${month}-${day} ${hour}:00`;
      } else {
        intervalKey = createdDate.toISOString().split('T')[0];
      }

      if (!intervalMap[intervalKey]) {
        intervalMap[intervalKey] = {
          timeInterval: intervalKey,
          totalResolutionMinutes: 0,
          ticketCount: 0,
          avgResolutionMinutes: null,
        };
      }

      const createdTime = new Date(ticket.createdAt).getTime();
      const closedTime = new Date(ticket.closedAt!).getTime();
      const resolutionMinutes = (closedTime - createdTime) / (1000 * 60);

      intervalMap[intervalKey].totalResolutionMinutes += resolutionMinutes;
      intervalMap[intervalKey].ticketCount += 1;
    });

    // Calculate average resolution time for each interval
    Object.values(intervalMap).forEach((interval) => {
      if (interval.ticketCount > 0) {
        interval.avgResolutionMinutes = Math.round(
          interval.totalResolutionMinutes / interval.ticketCount,
        );
      }
    });

    return Object.values(intervalMap).sort((a, b) =>
      a.timeInterval.localeCompare(b.timeInterval),
    );
  }

  private groupTicketsBySource(
    tickets: Array<{ source: string }>,
  ): { source: string; count: number }[] {
    const sourceCounts: Record<string, number> = {};

    tickets.forEach((ticket) => {
      const source = ticket.source;
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    return Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
    }));
  }

  private groupTicketsByTimeInterval(
    tickets: Array<{ createdAt: Date; status: string }>,
    timeRange: string,
  ) {
    const intervalMap: Record<
      string,
      {
        timeInterval: string;
        totalTickets: number;
        openTickets: number;
        closedTickets: number;
        assignedTickets: number;
      }
    > = {};

    tickets.forEach((ticket) => {
      const date = new Date(ticket.createdAt);
      let intervalKey: string;

      if (timeRange === 'day') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        intervalKey = `${year}-${month}-${day} ${hour}:00`;
      } else {
        intervalKey = date.toISOString().split('T')[0];
      }

      if (!intervalMap[intervalKey]) {
        intervalMap[intervalKey] = {
          timeInterval: intervalKey,
          totalTickets: 0,
          openTickets: 0,
          closedTickets: 0,
          assignedTickets: 0,
        };
      }

      intervalMap[intervalKey].totalTickets += 1;
      if (ticket.status === 'OPEN') intervalMap[intervalKey].openTickets += 1;
      if (ticket.status === 'CLOSED')
        intervalMap[intervalKey].closedTickets += 1;
      if (ticket.status === 'ASSIGNED')
        intervalMap[intervalKey].assignedTickets += 1;
    });

    return Object.values(intervalMap).sort((a, b) =>
      a.timeInterval.localeCompare(b.timeInterval),
    );
  }
}
