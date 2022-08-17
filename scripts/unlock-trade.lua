-- unlock trade now
redis.call("HSET", "trade:" .. ARGV[1], "lock", "1");
redis.call("HSET", "user:" .. ARGV[2], "inventory-lock", "1");
redis.call("HSET", "user:" .. ARGV[3], "inventory-lock", "1");