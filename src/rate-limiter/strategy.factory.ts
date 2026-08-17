import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenBucketStrategy } from './strategies/token-bucket/token-bucket.strategy';
import { FixedWindowStrategy } from './strategies/fixed-window/fixed-window.strategy';
import { LimitResult } from './interfaces/limit-result.interface';
import { TokenBucketConfig } from './strategies/token-bucket/token-bucket.config';
import { FixedWindowConfig } from './strategies/fixed-window/fixed-window.config';

@Injectable()
export class StrategyFactory {
  private readonly strategyName: string;

  constructor(
    private readonly config: ConfigService,
    private readonly tokenBucketStrategy: TokenBucketStrategy,
    private readonly fixedWindowStrategy: FixedWindowStrategy,
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

      default:
        throw new Error(`Unknown rate limiter strategy: ${this.strategyName}`);
    }
  }

  getStrategyName(): string {
    return this.strategyName;
  }
}
