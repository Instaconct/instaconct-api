"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgSdkModule = void 0;
const common_1 = require("@nestjs/common");
const org_sdk_service_1 = require("./org_sdk.service");
const org_sdk_controller_1 = require("./org_sdk.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const org_sdk_processor_1 = require("./org_sdk.processor");
const auth_module_1 = require("../auth/auth.module");
let OrgSdkModule = class OrgSdkModule {
};
exports.OrgSdkModule = OrgSdkModule;
exports.OrgSdkModule = OrgSdkModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        controllers: [org_sdk_controller_1.OrgSdkController],
        providers: [org_sdk_service_1.OrgSdkService, org_sdk_processor_1.SdkConsumer],
    })
], OrgSdkModule);
//# sourceMappingURL=org_sdk.module.js.map