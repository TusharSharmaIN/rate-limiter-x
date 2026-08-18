import { Body, Controller, Get, Post } from '@nestjs/common';
import { StrategyFactory, AVAILABLE_STRATEGIES } from './strategy.factory';
import type { StrategyName } from './strategy.factory';

@Controller('admin')
export class AdminController {
  constructor(private readonly strategyFactory: StrategyFactory) {}

  @Get('strategy')
  getCurrentStrategy() {
    return {
      current: this.strategyFactory.getCurrentStrategyName(),
      available: AVAILABLE_STRATEGIES,
    };
  }

  @Post('strategy')
  setStrategy(@Body('strategy') strategy: StrategyName) {
    this.strategyFactory.setStrategy(strategy);
    return { success: true, current: strategy };
  }
}
