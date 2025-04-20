import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export default class CacheService {
  constructor(@InjectRedis() private _redis: Redis) {}

  async get(key: string): Promise<any> {
    return this._redis.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this._redis.set(key, value, 'EX', ttl || 300); // Default TTL is 5 minutes
  }

  async getMany(): Promise<string[]> {
    const keys = await this._redis.keys('product*');
    return keys;
  }

  async delMany(keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this._redis.del(...keys);
    }
  }
}
