-- KEYS[1] = bucket key, e.g. "leakybucket:user:123"
-- ARGV[1] = capacity (max water level)
-- ARGV[2] = leakRatePerSec (how fast the bucket drains)
-- ARGV[3] = now (unix time in ms)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local leakRatePerSec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call('HMGET', key, 'level', 'lastLeakTime')
local level = tonumber(bucket[1])
local lastLeakTime = tonumber(bucket[2])

if level == nil then
  level = 0
  lastLeakTime = now
end

-- How much has leaked out since we last checked?
local elapsedSec = (now - lastLeakTime) / 1000
if elapsedSec < 0 then elapsedSec = 0 end

local leaked = elapsedSec * leakRatePerSec
level = math.max(0, level - leaked)

local allowed = 0
local retryAfterMs = 0

if level + 1 <= capacity then
  level = level + 1
  allowed = 1
else
  -- Deny: how long until enough has leaked out to fit 1 more request?
  local overflow = (level + 1) - capacity
  retryAfterMs = math.ceil((overflow / leakRatePerSec) * 1000)
end

redis.call('HMSET', key, 'level', level, 'lastLeakTime', now)
redis.call('EXPIRE', key, 3600)

local remaining = capacity - level
if remaining < 0 then remaining = 0 end

return { allowed, math.floor(remaining), retryAfterMs }