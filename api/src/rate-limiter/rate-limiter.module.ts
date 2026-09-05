import { Module } from '@nestjs/common';
import { RateLimiterController } from './rate-limiter.controller';
import { RateLimiterService } from './rate-limiter.service';
import { StrategyFactory } from './strategy.factory';
import { TokenBucketStrategy } from './strategies/token-bucket/token-bucket.strategy';
import { FixedWindowStrategy } from './strategies/fixed-window/fixed-window.strategy';
import { SlidingWindowLogStrategy } from './strategies/sliding-window-log/sliding-window-log.strategy';
import { SlidingWindowCounterStrategy } from './strategies/sliding-window-counter/sliding-window-counter.strategy';
import { LeakyBucketStrategy } from './strategies/leaky-bucket/leaky-bucket-strategy';
import { AdminController } from './admin.controller';
import { RateLimiterHttpController } from './rate-limiter-http.controller';
import { RuntimeConfigService } from './runtime-config.service';
import { ConfigController } from './config.controller';

@Module({
  controllers: [
    RateLimiterController,
    AdminController,
    RateLimiterHttpController,
    ConfigController,
  ],
  providers: [
    RateLimiterService,
    RuntimeConfigService,
    StrategyFactory,
    TokenBucketStrategy,
    FixedWindowStrategy,
    SlidingWindowLogStrategy,
    SlidingWindowCounterStrategy,
    LeakyBucketStrategy,
  ],
})
export class RateLimiterModule {}
