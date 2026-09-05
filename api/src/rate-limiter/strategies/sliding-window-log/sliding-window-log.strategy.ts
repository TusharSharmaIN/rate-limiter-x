import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RedisService } from '../../../redis/redis.service';
import { RateLimiterStrategy } from '../../interfaces/rate-limiter-strategy.interface';
import { LimitResult } from '../../interfaces/limit-result.interface';
import { SlidingWindowLogConfig } from './sliding-window-log.config';
import { FailOpenCounterService } from '../../../observability/fail-open-counter.service';

@Injectable()
export class SlidingWindowLogStrategy implements RateLimiterStrategy<SlidingWindowLogConfig> {
  private readonly logger = new Logger(SlidingWindowLogStrategy.name);
  private readonly script: string;

  constructor(
    private readonly redis: RedisService,
    private readonly failOpenCounter: FailOpenCounterService,
  ) {
    this.script = fs.readFileSync(
      path.join(__dirname, 'sliding-window-log.lua'),
      'utf-8',
    );
  }

  async checkLimit(
    key: string,
    config: SlidingWindowLogConfig,
  ): Promise<LimitResult> {
    const logKey = `slidinglog:${key}`;
    const now = Date.now();
    const willFailOpen = this.redis.shouldFailOpen();

    if (!this.redis.isHealthy()) {
      this.failOpenCounter.increment();
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
        [logKey],
        [config.capacity, config.windowSizeSec, now],
      );
      const [allowed, remaining, retryAfterMs] = result;
      return { allowed: allowed === 1, remaining, retryAfterMs, checked: true };
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
