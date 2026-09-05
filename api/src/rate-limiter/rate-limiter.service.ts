import { Injectable } from '@nestjs/common';
import { StrategyFactory } from './strategy.factory';
import { LimitResult } from './interfaces/limit-result.interface';

@Injectable()
export class RateLimiterService {
  constructor(private readonly strategyFactory: StrategyFactory) {}

  async checkLimit(key: string): Promise<LimitResult> {
    return this.strategyFactory.checkLimit(key);
  }
}
