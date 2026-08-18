import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RuntimeConfigService {
  private overrides: Record<string, number> = {};

  constructor(private readonly config: ConfigService) {}

  get(key: string, defaultPath: string, fallback: number): number {
    return (
      this.overrides[key] ?? this.config.get<number>(defaultPath, fallback)
    );
  }

  set(key: string, value: number) {
    this.overrides[key] = value;
  }

  getAll() {
    return {
      capacity: this.get('capacity', 'rateLimiter.capacity', 10),
      refillRatePerSec: this.get(
        'refillRatePerSec',
        'rateLimiter.refillRatePerSec',
        1,
      ),
      windowSizeSec: this.get('windowSizeSec', 'rateLimiter.windowSizeSec', 60),
      leakRatePerSec: this.get(
        'leakRatePerSec',
        'rateLimiter.leakRatePerSec',
        1,
      ),
    };
  }
}
