import { createParamDecorator } from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator((data, req): User => {
  return req.args[0]['user'] as User;
});
