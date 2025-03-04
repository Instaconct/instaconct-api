"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const jwt_provider_1 = require("../auth/provider/jwt.provider");
let TicketService = class TicketService {
    constructor(prismaService, jwtProvider) {
        this.prismaService = prismaService;
        this.jwtProvider = jwtProvider;
    }
    async create(createTicketDto, organizationId) {
        try {
            const ticket = await this.prismaService.ticket.create({
                data: {
                    organization: { connect: { id: organizationId } },
                    customer: {
                        connectOrCreate: {
                            where: {
                                email_organizationId: {
                                    email: createTicketDto.customer.email,
                                    organizationId: organizationId,
                                },
                            },
                            create: {
                                email: createTicketDto.customer.email,
                                name: createTicketDto.customer.name,
                                phone: createTicketDto.customer.phone,
                                organization: { connect: { id: organizationId } },
                            },
                        },
                    },
                },
                include: {
                    customer: true,
                },
            });
            return { ticketId: ticket.id, customer: ticket.customer };
        }
        catch (error) {
            console.log(error);
            if (error.meta.target === 'User_phone_key') {
                throw new common_1.ConflictException('Phone number already exists');
            }
            if (error.meta.target === 'User_email_key') {
                throw new common_1.ConflictException('Email already exists');
            }
        }
    }
    async findAll(organizationId) {
        return this.prismaService.ticket.findMany({
            where: { status: client_1.TicketStatus.OPEN, organizationId },
            include: {
                organization: true,
                customer: true,
            },
        });
    }
    async findOne(id, organizationId) {
        return this.prismaService.ticket.findUnique({
            where: { id, organizationId },
            include: {
                organization: true,
                customer: true,
            },
        });
    }
    async closeTicket(ticketId) {
        return await this.prismaService.ticket.update({
            where: { id: ticketId },
            data: {
                status: client_1.TicketStatus.CLOSED,
            },
        });
    }
    async findMessages(ticketId, organizationId) {
        return await this.prismaService.message.findMany({
            where: { ticketId, ticket: { organizationId } },
            include: {
                sender: true,
                customer: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.TicketService = TicketService;
exports.TicketService = TicketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_provider_1.Jwt])
], TicketService);
//# sourceMappingURL=ticket.service.js.map