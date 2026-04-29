import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  async hashValue(value: string, rounds: number = 10): Promise<string> {
    return bcrypt.hash(value, rounds);
  }

  async compareValue(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue);
  }
}
