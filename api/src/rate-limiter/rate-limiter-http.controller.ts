import { Controller, Get, Query } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('rate-limiter')
@Controller('check-limit')
export class RateLimiterHttpController {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  @ApiOperation({ summary: 'Check if a key is allowed (HTTP)' })
  @Get()
  async checkLimit(@Query('key') key: string) {
    return this.rateLimiterService.checkLimit(key || 'default');
  }
}
