import { Controller, Get, Post } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('observability')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @ApiOperation({ summary: 'Get all stats' })
  @Get()
  getStats() {
    return this.statsService.getStats();
  }

  @ApiOperation({ summary: 'Reset all stats' })
  @Post('reset')
  resetStats() {
    this.statsService.resetStats();
    return { success: true };
  }
}
