import { Injectable } from '@nestjs/common';
import { StrategyName } from '../rate-limiter/strategy.factory';

export interface StrategyStats {
  allowed: number;
  denied: number;
}

@Injectable()
export class StatsService {
  private totalAllowed = 0;
  private totalDenied = 0;
  private perStrategy: Record<string, StrategyStats> = {};

  record(strategy: StrategyName, allowed: boolean) {
    if (!this.perStrategy[strategy]) {
      this.perStrategy[strategy] = { allowed: 0, denied: 0 };
    }

    if (allowed) {
      this.totalAllowed++;
      this.perStrategy[strategy].allowed++;
    } else {
      this.totalDenied++;
      this.perStrategy[strategy].denied++;
    }
  }

  getStats() {
    return {
      totalAllowed: this.totalAllowed,
      totalDenied: this.totalDenied,
      totalRequests: this.totalAllowed + this.totalDenied,
      perStrategy: this.perStrategy,
    };
  }

  resetStats() {
    this.totalAllowed = 0;
    this.totalDenied = 0;
    this.perStrategy = {};
  }
}
