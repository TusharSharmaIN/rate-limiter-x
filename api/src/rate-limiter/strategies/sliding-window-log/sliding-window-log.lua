-- KEYS[1] = sorted set key, e.g. "slidinglog:user:123"
-- ARGV[1] = capacity (max requests allowed in the window)
-- ARGV[2] = windowSizeSec
-- ARGV[3] = now (unix time in ms)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local windowSizeSec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local windowStart = now - (windowSizeSec * 1000)

-- Step 1: remove all entries older than the window (score = timestamp)
redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

-- Step 2: count what's left (all requests still "in window")
local count = redis.call('ZCARD', key)

local allowed = 0
local retryAfterMs = 0

if count < capacity then
  -- Step 3: record this request. Use 'now' as both score and a unique member
  -- (append a random-ish suffix so two requests at the exact same ms don't collide)
  local member = now .. '-' .. math.random(1, 1000000)
  redis.call('ZADD', key, now, member)
  allowed = 1
else
  -- Step 4: deny. Find the OLDEST entry still in window — when it slides out,
  -- there'll be room again. That's our retryAfterMs.
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local oldestTimestamp = tonumber(oldest[2])
  retryAfterMs = (oldestTimestamp + (windowSizeSec * 1000)) - now
  if retryAfterMs < 0 then retryAfterMs = 0 end
end

-- Keep the key from living forever if the client goes quiet
redis.call('EXPIRE', key, windowSizeSec)

local remaining = capacity - redis.call('ZCARD', key)
if remaining < 0 then remaining = 0 end

return { allowed, remaining, retryAfterMs }