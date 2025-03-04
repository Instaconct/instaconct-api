"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckOwnership = void 0;
const common_1 = require("@nestjs/common");
exports.CheckOwnership = (0, common_1.createParamDecorator)((requiredRoles, context) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!requiredRoles?.length)
        return true;
    return (requiredRoles.some((role) => user.role === role) &&
        (request.params.id === user.id ||
            request.query.organizationId === user.organizationId));
});
//# sourceMappingURL=check-owner.decorators.js.map