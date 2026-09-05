-- KEYS[1] = bucket key, e.g. "bucket:user:123"
-- ARGV[1] = capacity (max tokens)
-- ARGV[2] = refillRatePerSec (tokens added per second)
-- ARGV[3] = now (current unix time in ms, passed from Node so all logic uses ONE consistent clock)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRatePerSec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Read existing bucket state (a Redis HASH: {tokens, lastRefillTime})
local bucket = redis.call('HMGET', key, 'tokens', 'lastRefillTime')
local tokens = tonumber(bucket[1])
local lastRefillTime = tonumber(bucket[2])

-- First time we see this key: bucket starts full
if tokens == nil then
  tokens = capacity
  lastRefillTime = now
end

-- How much time has passed since last refill? (convert ms -> sec)
local elapsedSec = (now - lastRefillTime) / 1000
if elapsedSec < 0 then elapsedSec = 0 end -- clock safety guard

-- Refill tokens based on elapsed time, capped at capacity
local refill = elapsedSec * refillRatePerSec
tokens = math.min(capacity, tokens + refill)

local allowed = 0
local retryAfterMs = 0

if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
else
  -- Not enough tokens: calculate ms until at least 1 token will exist
  local deficit = 1 - tokens
  retryAfterMs = math.ceil((deficit / refillRatePerSec) * 1000)
end

-- Persist new state atomically (still inside this same script = still atomic)
redis.call('HMSET', key, 'tokens', tokens, 'lastRefillTime', now)
-- Let the bucket expire if unused for a while, so idle keys don't leak memory forever
redis.call('EXPIRE', key, 3600)

return { allowed, math.floor(tokens), retryAfterMs }