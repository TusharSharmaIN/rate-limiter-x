import { LimitResult } from './limit-result.interface';

export interface RateLimiterStrategy<TConfig = unknown> {
  checkLimit(key: string, config: TConfig): Promise<LimitResult>;
}
