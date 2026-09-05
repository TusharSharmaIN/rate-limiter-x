import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RateLimiterService } from './rate-limiter.service';

interface CheckLimitRequest {
  key: string;
}

@Controller()
export class RateLimiterController {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  @GrpcMethod('RateLimiter', 'CheckLimit')
  async checkLimit(data: CheckLimitRequest) {
    const result = await this.rateLimiterService.checkLimit(data.key);
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      retryAfterMs: result.retryAfterMs,
      checked: result.checked,
    };
  }
}
