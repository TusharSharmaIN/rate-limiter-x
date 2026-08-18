import { Body, Controller, Get, Post } from '@nestjs/common';
import { StrategyFactory, AVAILABLE_STRATEGIES } from './strategy.factory';
import type { StrategyName } from './strategy.factory';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('rate-limiter')
@Controller('admin')
export class AdminController {
  constructor(private readonly strategyFactory: StrategyFactory) {}

  @ApiOperation({ summary: 'Get current rate limiter strategy' })
  @Get('strategy')
  getCurrentStrategy() {
    return {
      current: this.strategyFactory.getCurrentStrategyName(),
      available: AVAILABLE_STRATEGIES,
    };
  }

  @ApiOperation({ summary: 'Set current rate limiter strategy' })
  @Post('strategy')
  setStrategy(@Body('strategy') strategy: StrategyName) {
    this.strategyFactory.setStrategy(strategy);
    return { success: true, current: strategy };
  }
}
