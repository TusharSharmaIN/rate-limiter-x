import { Injectable } from '@nestjs/common';

@Injectable()
export class FailOpenCounterService {
  private count = 0;
  private lastFailOpenAt: number | null = null;

  increment() {
    this.count++;
    this.lastFailOpenAt = Date.now();
  }

  getStats() {
    return {
      totalFailOpenEvents: this.count,
      lastFailOpenAt: this.lastFailOpenAt,
    };
  }
}
