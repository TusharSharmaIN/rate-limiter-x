-- KEYS[1] = window key, e.g. "fixedwindow:user:123"
-- ARGV[1] = capacity (max requests per window)
-- ARGV[2] = windowSizeSec (e.g. 60)
-- ARGV[3] = now (unix time in ms)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local windowSizeSec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Which window are we currently in? (integer bucket id)
local windowId = math.floor(now / 1000 / windowSizeSec)
local windowKey = key .. ':' .. windowId

local count = redis.call('INCR', windowKey)

-- Set expiry only on first request in this window (avoids resetting TTL every call)
if count == 1 then
  redis.call('EXPIRE', windowKey, windowSizeSec)
end

local allowed = 0
local retryAfterMs = 0

if count <= capacity then
  allowed = 1
else
  -- Deny: tell caller how long until the NEXT window starts
  local windowStartSec = windowId * windowSizeSec
  local windowEndSec = windowStartSec + windowSizeSec
  retryAfterMs = math.ceil((windowEndSec * 1000) - now)
end

local remaining = capacity - count
if remaining < 0 then remaining = 0 end

return { allowed, remaining, retryAfterMs }