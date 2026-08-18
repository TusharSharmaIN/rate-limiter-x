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
import { StatsService } from 'src/observability/stats.service';
import { RuntimeConfigService } from './runtime-config.service';

export const AVAILABLE_STRATEGIES = [
  'token_bucket',
  'fixed_window',
  'sliding_window_log',
  'sliding_window_counter',
  'leaky_bucket',
] as const;

export type StrategyName = (typeof AVAILABLE_STRATEGIES)[number];

@Injectable()
export class StrategyFactory {
  private currentStrategyName: StrategyName;

  constructor(
    private readonly config: ConfigService,
    private readonly runtimeConfig: RuntimeConfigService,
    private readonly tokenBucketStrategy: TokenBucketStrategy,
    private readonly fixedWindowStrategy: FixedWindowStrategy,
    private readonly slidingWindowLogStrategy: SlidingWindowLogStrategy,
    private readonly slidingWindowCounterStrategy: SlidingWindowCounterStrategy,
    private readonly leakyBucketStrategy: LeakyBucketStrategy,
    private readonly statsService: StatsService,
  ) {
    this.currentStrategyName = this.config.get<StrategyName>(
      'rateLimiter.strategy',
      'token_bucket',
    );
  }

  getCurrentStrategyName(): StrategyName {
    return this.currentStrategyName;
  }

  setStrategy(name: StrategyName): void {
    if (!AVAILABLE_STRATEGIES.includes(name)) {
      throw new Error(`Unknown strategy: ${name}`);
    }
    this.currentStrategyName = name;
  }

  async checkLimit(key: string): Promise<LimitResult> {
    const strategyName = this.currentStrategyName;
    let result: LimitResult;

    switch (strategyName) {
      case 'token_bucket': {
        const cfg: TokenBucketConfig = {
          capacity: this.runtimeConfig.get(
            'capacity',
            'rateLimiter.capacity',
            10,
          ),
          refillRatePerSec: this.runtimeConfig.get(
            'refillRatePerSec',
            'rateLimiter.refillRatePerSec',
            1,
          ),
        };
        result = await this.tokenBucketStrategy.checkLimit(key, cfg);
        break;
      }
      case 'fixed_window': {
        const cfg: FixedWindowConfig = {
          capacity: this.runtimeConfig.get(
            'capacity',
            'rateLimiter.capacity',
            10,
          ),
          windowSizeSec: this.runtimeConfig.get(
            'windowSizeSec',
            'rateLimiter.windowSizeSec',
            60,
          ),
        };
        result = await this.fixedWindowStrategy.checkLimit(key, cfg);
        break;
      }
      case 'sliding_window_log': {
        const cfg: SlidingWindowLogConfig = {
          capacity: this.runtimeConfig.get(
            'capacity',
            'rateLimiter.capacity',
            10,
          ),
          windowSizeSec: this.runtimeConfig.get(
            'windowSizeSec',
            'rateLimiter.windowSizeSec',
            60,
          ),
        };
        result = await this.slidingWindowLogStrategy.checkLimit(key, cfg);
        break;
      }
      case 'sliding_window_counter': {
        const cfg: SlidingWindowCounterConfig = {
          capacity: this.runtimeConfig.get(
            'capacity',
            'rateLimiter.capacity',
            10,
          ),
          windowSizeSec: this.runtimeConfig.get(
            'windowSizeSec',
            'rateLimiter.windowSizeSec',
            60,
          ),
        };
        result = await this.slidingWindowCounterStrategy.checkLimit(key, cfg);
        break;
      }
      case 'leaky_bucket': {
        const cfg: LeakyBucketConfig = {
          capacity: this.runtimeConfig.get(
            'capacity',
            'rateLimiter.capacity',
            10,
          ),
          leakRatePerSec: this.runtimeConfig.get(
            'leakRatePerSec',
            'rateLimiter.leakRatePerSec',
            1,
          ),
        };
        result = await this.leakyBucketStrategy.checkLimit(key, cfg);
        break;
      }
      default:
        throw new Error(
          `Unknown rate limiter strategy: ${this.currentStrategyName}`,
        );
    }

    this.statsService.record(strategyName, result.allowed);
    return result;
  }
}
