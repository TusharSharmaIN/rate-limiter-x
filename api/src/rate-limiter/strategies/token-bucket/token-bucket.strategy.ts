import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RedisService } from '../../../redis/redis.service';
import { RateLimiterStrategy } from '../../interfaces/rate-limiter-strategy.interface';
import { LimitResult } from '../../interfaces/limit-result.interface';
import { TokenBucketConfig } from './token-bucket.config';
import { FailOpenCounterService } from 'src/observability/fail-open-counter.service';

@Injectable()
export class TokenBucketStrategy implements RateLimiterStrategy<TokenBucketConfig> {
  private readonly logger = new Logger(TokenBucketStrategy.name);
  private readonly script: string;

  constructor(
    private readonly redis: RedisService,
    private readonly failOpenCounter: FailOpenCounterService,
  ) {
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
      this.failOpenCounter.increment();
      const willFailOpen = this.redis.shouldFailOpen();

      this.logger.warn(
        JSON.stringify({
          event: 'fail_open',
          reason: 'redis_unhealthy',
          key,
          action: willFailOpen ? 'allow' : 'deny',
        }),
      );
      return {
        allowed: willFailOpen,
        remaining: -1,
        retryAfterMs: 0,
        checked: false,
      };
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
      this.failOpenCounter.increment();
      const willFailOpen = this.redis.shouldFailOpen();
      this.logger.error(`Redis EVAL failed for key=${key}: ${err.message}`);
      return {
        allowed: willFailOpen,
        remaining: -1,
        retryAfterMs: 0,
        checked: false,
      };
    }
  }
}
