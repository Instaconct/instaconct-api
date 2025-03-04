"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthWsMiddleware = void 0;
const AuthWsMiddleware = (organizationService, userService, jwtProvider) => {
    return async (socket, next) => {
        try {
            const token = socket.handshake?.auth?.token || socket.handshake?.headers['x-api-key'];
            if (!token) {
                throw new Error('Unauthorized');
            }
            const payload = jwtProvider.verify(token);
            if (!payload) {
                throw new Error('Unauthorized');
            }
            if (payload.sdkType) {
                const organization = await organizationService.findOne(payload.organizationId);
                if (!organization) {
                    throw new Error('Unauthorized');
                }
                socket.data.organization = organization;
                socket.data.organizationId = organization.id;
            }
            else {
                const user = await userService.findOneById(payload.id);
                if (!user) {
                    throw new Error('Unauthorized');
                }
                socket.data.user = user;
                socket.data.organizationId = user.organizationId;
            }
            next();
        }
        catch (error) {
            console.error(error);
            next(new Error('Unauthorized'));
        }
    };
};
exports.AuthWsMiddleware = AuthWsMiddleware;
//# sourceMappingURL=auth-ws.middleware.js.map