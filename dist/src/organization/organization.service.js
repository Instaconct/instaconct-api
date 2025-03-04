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
var OrganizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrganizationService = OrganizationService_1 = class OrganizationService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(OrganizationService_1.name);
    }
    async findOne(id, user) {
        const organization = await this.prismaService.organization.findUnique({
            where: { id },
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        if (user && organization.id !== user.organizationId) {
            throw new common_1.ForbiddenException('You do not have permission to view this organization');
        }
        return organization;
    }
    async update(id, updateOrganizationDto, user) {
        const organization = await this.prismaService.organization.findUnique({
            where: { id },
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        if (user.role !== client_1.Role.SUPER_MANAGER &&
            organization.id !== user.organizationId) {
            throw new common_1.ForbiddenException('You do not have permission to update this organization');
        }
        try {
            return await this.prismaService.organization.update({
                where: { id },
                data: updateOrganizationDto,
            });
        }
        catch (error) {
            this.logger.error(error);
            throw new common_1.BadRequestException('Failed to update organization');
        }
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = OrganizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map