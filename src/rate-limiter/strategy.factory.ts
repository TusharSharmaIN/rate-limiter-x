import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenBucketStrategy } from './strategies/token-bucket/token-bucket.strategy';
import { FixedWindowStrategy } from './strategies/fixed-window/fixed-window.strategy';
import { SlidingWindowLogStrategy } from './strategies/sliding-window-log/sliding-window-log.strategy';
import { LimitResult } from './interfaces/limit-result.interface';
import { TokenBucketConfig } from './strategies/token-bucket/token-bucket.config';
import { FixedWindowConfig } from './strategies/fixed-window/fixed-window.config';
import { SlidingWindowLogConfig } from './strategies/sliding-window-log/sliding-window-log.config';
import { SlidingWindowCounterConfig } from './strategies/sliding-window-counter/sliding-window-counter.config';
import { SlidingWindowCounterStrategy } from './strategies/sliding-window-counter/sliding-window-counter.strategy';
import { LeakyBucketConfig } from './strategies/leaky-bucket/leaky-bucket.config';
import { LeakyBucketStrategy } from './strategies/leaky-bucket/leaky-bucket-strategy';

@Injectable()
export class StrategyFactory {
  private readonly strategyName: string;

  constructor(
    private readonly config: ConfigService,
    private readonly tokenBucketStrategy: TokenBucketStrategy,
    private readonly fixedWindowStrategy: FixedWindowStrategy,
    private readonly slidingWindowLogStrategy: SlidingWindowLogStrategy,
    private readonly slidingWindowCounterStrategy: SlidingWindowCounterStrategy,
    private readonly leakyBucketStrategy: LeakyBucketStrategy,
  ) {
    this.strategyName = this.config.get<string>(
      'rateLimiter.strategy',
      'token_bucket',
    );
  }

  async checkLimit(key: string): Promise<LimitResult> {
    switch (this.strategyName) {
      case 'token_bucket': {
        const cfg: TokenBucketConfig = {
          capacity: this.config.get<number>('rateLimiter.capacity', 10),
          refillRatePerSec: this.config.get<number>(
            'rateLimiter.refillRatePerSec',
            1,
          ),
        };
        return this.tokenBucketStrategy.checkLimit(key, cfg);
      }

      case 'fixed_window': {
        const cfg: FixedWindowConfig = {
          capacity: this.config.get<number>('rateLimiter.capacity', 10),
          windowSizeSec: this.config.get<number>(
            'rateLimiter.windowSizeSec',
            60,
          ),
        };
        return this.fixedWindowStrategy.checkLimit(key, cfg);
      }

      case 'sliding_window_log': {
        const cfg: SlidingWindowLogConfig = {
          capacity: this.config.get<number>('rateLimiter.capacity', 10),
          windowSizeSec: this.config.get<number>(
            'rateLimiter.windowSizeSec',
            60,
          ),
        };
        return this.slidingWindowLogStrategy.checkLimit(key, cfg);
      }

      case 'sliding_window_counter': {
        const cfg: SlidingWindowCounterConfig = {
          capacity: this.config.get<number>('rateLimiter.capacity', 10),
          windowSizeSec: this.config.get<number>(
            'rateLimiter.windowSizeSec',
            60,
          ),
        };

        return this.slidingWindowCounterStrategy.checkLimit(key, cfg);
      }

      case 'leaky_bucket': {
        const cfg: LeakyBucketConfig = {
          capacity: this.config.get<number>('rateLimiter.capacity', 10),
          leakRatePerSec: this.config.get<number>(
            'rateLimiter.leakRatePerSec',
            1,
          ),
        };

        return this.leakyBucketStrategy.checkLimit(key, cfg);
      }

      default:
        throw new Error(`Unknown rate limiter strategy: ${this.strategyName}`);
    }
  }

  getStrategyName(): string {
    return this.strategyName;
  }
}
