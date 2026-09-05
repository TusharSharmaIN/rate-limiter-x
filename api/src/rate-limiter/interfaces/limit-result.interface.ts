export interface LimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  checked: boolean;
}
