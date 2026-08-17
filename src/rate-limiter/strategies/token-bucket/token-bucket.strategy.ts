import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RedisService } from '../../../redis/redis.service';
import { RateLimiterStrategy } from '../../interfaces/rate-limiter-strategy.interface';
import { LimitResult } from '../../interfaces/limit-result.interface';
import { TokenBucketConfig } from './token-bucket.config';

@Injectable()
export class TokenBucketStrategy implements RateLimiterStrategy<TokenBucketConfig> {
  private readonly logger = new Logger(TokenBucketStrategy.name);
  private readonly script: string;

  constructor(private readonly redis: RedisService) {
    // Load the Lua file once at startup, not on every request
    this.script = fs.readFileSync(
      path.join(__dirname, 'token-bucket.lua'),
      'utf-8',
    );
  }

  async checkLimit(
    key: string,
    config: TokenBucketConfig,
  ): Promise<LimitResult> {
    const bucketKey = `bucket:${key}`;
    const now = Date.now();

    // Fail-open check: if Redis is known-unhealthy, don't even attempt the call
    if (!this.redis.isHealthy()) {
      this.logger.warn(
        `Fail-open: Redis unhealthy, allowing key=${key} unchecked`,
      );
      return { allowed: true, remaining: -1, retryAfterMs: 0, checked: false };
    }

    try {
      const result = await this.redis.evalScript<[number, number, number]>(
        this.script,
        [bucketKey],
        [config.capacity, config.refillRatePerSec, now],
      );

      const [allowed, remaining, retryAfterMs] = result;
      return {
        allowed: allowed === 1,
        remaining,
        retryAfterMs,
        checked: true,
      };
    } catch (err) {
      // Redis call itself failed mid-flight (e.g. dropped connection) — fail open here too
      this.logger.error(`Redis EVAL failed for key=${key}: ${err.message}`);
      return { allowed: true, remaining: -1, retryAfterMs: 0, checked: false };
    }
  }
}
