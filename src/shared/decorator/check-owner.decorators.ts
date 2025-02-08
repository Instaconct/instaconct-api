import { createParamDecorator } from '@nestjs/common';
import { Role } from '@prisma/client';

export const CheckOwnership = createParamDecorator(
  (requiredRoles: Role[], req): boolean => {
    const user = req.args[0].user;
    if (!requiredRoles?.length) return true;

    return (
      requiredRoles.some((role) => user.role === role) ||
      req.args[0].params.id === user.id
    );
  },
);
