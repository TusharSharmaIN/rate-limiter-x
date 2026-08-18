import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private healthy = true;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get<string>('redis.url');

    this.client = redisUrl
      ? new Redis(redisUrl, {
          tls: {},
          retryStrategy: (times) =>
            Math.min(
              times * 200,
              this.config.get<number>('redis.retryMaxDelayMs', 2000),
            ),
        })
      : new Redis({
          host: this.config.get<string>('redis.host'),
          port: this.config.get<number>('redis.port'),
          retryStrategy: (times) =>
            Math.min(
              times * 200,
              this.config.get<number>('redis.retryMaxDelayMs', 2000),
            ),
        });

    this.client.on('error', (err) => {
      this.healthy = false;
      this.logger.warn(`Redis connection error: ${err.message}`);
    });

    this.client.on('connect', () => {
      this.healthy = true;
      this.logger.log('Redis connected');
    });
  }

  onModuleInit() {}
  onModuleDestroy() {
    this.client.disconnect();
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  shouldFailOpen(): boolean {
    return this.config.get<boolean>('rateLimiter.failOpenEnabled', true);
  }

  async evalScript<T = any>(
    script: string,
    keys: string[],
    args: (string | number)[],
  ): Promise<T> {
    return this.client.eval(
      script,
      keys.length,
      ...keys,
      ...args,
    ) as Promise<T>;
  }
}
