import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { FailOpenCounterService } from './fail-open-counter.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly failOpenCounter: FailOpenCounterService,
  ) {}

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
