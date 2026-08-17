import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RedisService } from '../../../redis/redis.service';
import { RateLimiterStrategy } from '../../interfaces/rate-limiter-strategy.interface';
import { LimitResult } from '../../interfaces/limit-result.interface';
import { FixedWindowConfig } from './fixed-window.config';
import { FailOpenCounterService } from 'src/observability/fail-open-counter.service';

@Injectable()
export class FixedWindowStrategy implements RateLimiterStrategy<FixedWindowConfig> {
  private readonly logger = new Logger(FixedWindowStrategy.name);
  private readonly script: string;

  constructor(
    private readonly redis: RedisService,
    private readonly failOpenCounter: FailOpenCounterService,
  ) {
    this.script = fs.readFileSync(
      path.join(__dirname, 'fixed-window.lua'),
      'utf-8',
    );
  }

  async checkLimit(
    key: string,
    config: FixedWindowConfig,
  ): Promise<LimitResult> {
    const windowKey = `fixedwindow:${key}`;
    const now = Date.now();
    const windowSizeSec = config.windowSizeSec ?? 60;

    if (!this.redis.isHealthy()) {
      this.failOpenCounter.increment();
      this.logger.warn(
        JSON.stringify({ event: 'fail_open', reason: 'redis_unhealthy', key }),
      );
      return { allowed: true, remaining: -1, retryAfterMs: 0, checked: false };
    }

    try {
      const result = await this.redis.evalScript<[number, number, number]>(
        this.script,
        [windowKey],
        [config.capacity, windowSizeSec, now],
      );

      const [allowed, remaining, retryAfterMs] = result;
      return { allowed: allowed === 1, remaining, retryAfterMs, checked: true };
    } catch (err) {
      this.failOpenCounter.increment();
      this.logger.error(`Redis EVAL failed for key=${key}: ${err.message}`);
      return { allowed: true, remaining: -1, retryAfterMs: 0, checked: false };
    }
  }
}
