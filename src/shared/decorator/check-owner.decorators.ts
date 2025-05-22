import { createParamDecorator } from '@nestjs/common';
import { Role } from '@prisma/client';

export const CheckOwnership = createParamDecorator(
  (requiredRoles: Role[], context): boolean => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!requiredRoles?.length) return true;

    return (
      requiredRoles.some((role) => user.role === role) &&
      (request.params.id === user.id ||
        request.query.organizationId === user.organizationId)
    );
  },
);
