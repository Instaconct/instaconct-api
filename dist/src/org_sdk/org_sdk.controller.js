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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgSdkController = void 0;
const common_1 = require("@nestjs/common");
const org_sdk_service_1 = require("./org_sdk.service");
const authentication_guard_1 = require("../auth/guard/authentication.guard");
const roles_guard_1 = require("../auth/guard/roles.guard");
const user_decorator_1 = require("../shared/decorator/user.decorator");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../shared/decorator/roles.decorator");
let OrgSdkController = class OrgSdkController {
    constructor(orgSdkService) {
        this.orgSdkService = orgSdkService;
    }
    async getOrgSDKs(user) {
        return this.orgSdkService.getOrgSDKs(user.organizationId);
    }
};
exports.OrgSdkController = OrgSdkController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrgSdkController.prototype, "getOrgSDKs", null);
exports.OrgSdkController = OrgSdkController = __decorate([
    (0, common_1.Controller)('sdk'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [org_sdk_service_1.OrgSdkService])
], OrgSdkController);
//# sourceMappingURL=org_sdk.controller.js.map