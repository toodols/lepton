-- attempts to locks the tradeid, senderid, receiverid and returns 1 if successful, 0 if not

local tradeLock = redis.call("hGet", "trade:" .. ARGV[1], "lock");
local senderLock = redis.call("hGet", "user:" .. ARGV[2], "inventory-lock");
local receiverLock = redis.call("hGet", "user:" .. ARGV[3], "inventory-lock");

if tradeLock == 1 or senderLock == 1 or receiverLock == 1 then
	return 0;
end

redis.call("hSet", "trade:" .. ARGV[1], "lock", 1);
redis.call("hSet", "user:" .. ARGV[2], "inventory-lock", 1);
redis.call("hSet", "user:" .. ARGV[3], "inventory-lock", 1);

redis.call("expire", "trade:" .. ARGV[1], 60);
redis.call("expire", "user:" .. ARGV[2], 60);
redis.call("expire", "user:" .. ARGV[3], 60);

return 1;