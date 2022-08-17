local invLock = redis.call("hGet", "user:" .. ARGV[1], "inventory-lock");
if invLock == "1" then
	return 0;
end

redis.call("hSet", "user:" .. ARGV[1], "inventory-lock", "1");
redis.call("expire", "user:" .. ARGV[1], 60);

return 1;