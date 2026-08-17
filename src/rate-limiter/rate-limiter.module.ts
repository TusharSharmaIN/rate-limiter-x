import { Module } from '@nestjs/common';
import { RateLimiterController } from './rate-limiter.controller';
import { RateLimiterService } from './rate-limiter.service';
import { StrategyFactory } from './strategy.factory';
import { TokenBucketStrategy } from './strategies/token-bucket/token-bucket.strategy';
import { FixedWindowStrategy } from './strategies/fixed-window/fixed-window.strategy';

@Module({
  controllers: [RateLimiterController],
  providers: [
    RateLimiterService,
    StrategyFactory,
    TokenBucketStrategy,
    FixedWindowStrategy,
  ],
})
export class RateLimiterModule {}
