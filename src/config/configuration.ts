export default () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  rateLimiter: {
    strategy: process.env.RATE_LIMIT_STRATEGY || 'token_bucket',
    capacity: parseInt(process.env.RATE_LIMIT_CAPACITY || '10', 10),
    refillRatePerSec: parseFloat(process.env.RATE_LIMIT_REFILL_PER_SEC || '1'),
    windowSizeSec: parseInt(process.env.RATE_LIMIT_WINDOW_SIZE_SEC || '60', 10),
  },
});
