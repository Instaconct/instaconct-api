import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class Hash {
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  async comparePassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, hash] = storedHash.split(':');
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === computedHash;
  }

  async generateRandomString(length: number = 26): Promise<string> {
    return crypto.randomBytes(length).toString('hex');
  }
}
