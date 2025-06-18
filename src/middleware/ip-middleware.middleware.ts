import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class IpMiddlewareMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);
    next();
  }
}
