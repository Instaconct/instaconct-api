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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const authentication_guard_1 = require("../auth/guard/authentication.guard");
const roles_guard_1 = require("../auth/guard/roles.guard");
const roles_decorator_1 = require("../shared/decorator/roles.decorator");
const client_1 = require("@prisma/client");
const check_owner_decorators_1 = require("../shared/decorator/check-owner.decorators");
const filter_user_dto_1 = require("./dto/filter-user.dto");
const user_decorator_1 = require("../shared/decorator/user.decorator");
const platform_express_1 = require("@nestjs/platform-express");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    createAgent(createUserDto) {
        return this.userService.createAgent(createUserDto);
    }
    createAgentCsv(file, user) {
        return this.userService.readCsv(file, user.organizationId);
    }
    createAgentExcel(file, user) {
        return this.userService.readExcelSheet(file, user.organizationId);
    }
    async createManager(createUserDto) {
        return this.userService.createManager(createUserDto);
    }
    findAll(filterUserDto, haveAccess) {
        if (!haveAccess)
            throw new common_1.ForbiddenException('You do not have access to this resource');
        return this.userService.findAll(filterUserDto);
    }
    findAllAgent(user) {
        return this.userService.findAllAgent(user.organizationId);
    }
    findOne(id, haveAccess) {
        if (!haveAccess)
            throw new common_1.ForbiddenException('You do not have access to this resource');
        return this.userService.findOneById(id);
    }
    update(id, updateUserDto, user) {
        return this.userService.update(id, updateUserDto, user);
    }
    remove(id, user) {
        return this.userService.remove(id, user);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('/agent'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "createAgent", null);
__decorate([
    (0, common_1.Post)('/agent/csv'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 1024 * 1024 * 5,
        },
    })),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({
        fileType: 'csv',
    })
        .build({
        errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    }))),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "createAgentCsv", null);
__decorate([
    (0, common_1.Post)('/agent/excel'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 1024 * 1024 * 5,
        },
    })),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .build({
        errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    }))),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "createAgentExcel", null);
__decorate([
    (0, common_1.Post)('/manager'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createManager", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, check_owner_decorators_1.CheckOwnership)([client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER])),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_user_dto_1.FilterUserDto, Boolean]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('/agent'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAllAgent", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, check_owner_decorators_1.CheckOwnership)([client_1.Role.SUPER_MANAGER, client_1.Role.MANAGER])),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map