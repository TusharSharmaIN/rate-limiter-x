import { Controller, Get, Query } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';

@Controller('check-limit')
export class RateLimiterHttpController {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  @Get()
  async checkLimit(@Query('key') key: string) {
    return this.rateLimiterService.checkLimit(key || 'default');
  }
}
