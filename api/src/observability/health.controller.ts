import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RedisService } from '../redis/redis.service';
import { FailOpenCounterService } from './fail-open-counter.service';

@ApiTags('observability')
@Controller('health')
export class HealthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly failOpenCounter: FailOpenCounterService,
  ) {}

  @ApiOperation({ summary: 'Service + Redis health check' })
  @Get()
  check() {
    const redisHealthy = this.redisService.isHealthy();
    return {
      status: redisHealthy ? 'ok' : 'degraded',
      redis: {
        connected: redisHealthy,
      },
      failOpen: this.failOpenCounter.getStats(),
      timestamp: new Date().toISOString(),
    };
  }
}
