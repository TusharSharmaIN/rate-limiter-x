-- KEYS[1] = base key, e.g. "slidingcounter:user:123"
-- ARGV[1] = capacity
-- ARGV[2] = windowSizeSec
-- ARGV[3] = now (unix time in ms)

local baseKey = KEYS[1]
local capacity = tonumber(ARGV[1])
local windowSizeSec = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Which fixed window are we in right now? (same windowing idea as Fixed Window algorithm)
local currentWindowId = math.floor(now / 1000 / windowSizeSec)
local previousWindowId = currentWindowId - 1

local currentKey = baseKey .. ':' .. currentWindowId
local previousKey = baseKey .. ':' .. previousWindowId

local currentCount = tonumber(redis.call('GET', currentKey)) or 0
local previousCount = tonumber(redis.call('GET', previousKey)) or 0

-- How far are we into the CURRENT window, as a fraction (0.0 to 1.0)?
local windowStartSec = currentWindowId * windowSizeSec
local elapsedInCurrentWindow = (now / 1000) - windowStartSec
local elapsedFraction = elapsedInCurrentWindow / windowSizeSec

-- Weight given to the previous window = how much of it is still "in view"
local previousWeight = 1 - elapsedFraction

local estimatedCount = (previousCount * previousWeight) + currentCount

local allowed = 0
local retryAfterMs = 0

if estimatedCount < capacity then
  allowed = 1
  currentCount = redis.call('INCR', currentKey)
  if currentCount == 1 then
    -- expire after 2 full windows, since we still need to read this as "previous" next window
    redis.call('EXPIRE', currentKey, windowSizeSec * 2)
  end
else
  -- Rough estimate: time until enough of the previous window's weight decays for room to open
  local windowEndSec = windowStartSec + windowSizeSec
  retryAfterMs = math.ceil((windowEndSec * 1000) - now)
end

local remaining = capacity - math.floor(estimatedCount)
if remaining < 0 then remaining = 0 end

return { allowed, remaining, retryAfterMs }