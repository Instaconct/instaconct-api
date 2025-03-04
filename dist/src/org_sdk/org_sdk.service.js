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
exports.OrgSdkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrgSdkService = class OrgSdkService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.generateId = async (prefix) => {
            const { customAlphabet } = await import('nanoid');
            const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYё0123456789', 25);
            return `${prefix}_${nanoid()}`;
        };
    }
    async create(organizationId, sdkType) {
        return this.prismaService.orgManagementSDK.create({
            data: {
                organizationId: organizationId,
                private_key: await this.generateSDKPrivateKey(),
                public_key: await this.generateSDKPublicKey(),
                sdk: sdkType,
            },
        });
    }
    async getOrgSDKs(organizationId) {
        return this.prismaService.orgManagementSDK.findMany({
            where: {
                organizationId: organizationId,
            },
            omit: {
                created_at: true,
                updated_at: true,
            },
        });
    }
    async generateSDKPrivateKey() {
        return this.generateId('pvk_sdk');
    }
    async generateSDKPublicKey() {
        return this.generateId('org_sdk');
    }
};
exports.OrgSdkService = OrgSdkService;
exports.OrgSdkService = OrgSdkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrgSdkService);
//# sourceMappingURL=org_sdk.service.js.map