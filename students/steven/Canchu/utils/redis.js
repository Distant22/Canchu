const Redis = require("ioredis");

module.exports = {

    rateLimiter: (req, res, next) => {

        const redis = new Redis();
        const clientIP = req.ip; // Assuming you're using Express and the client IP is in req.ip

        // Replace 'CLIENT_IP' with the client IP or API key, and 'RATE_LIMIT_WINDOW' and 'RATE_LIMIT_MAX' with your desired limits.
        const key = `rate_limiter:${clientIP}`;
        const windowSeconds = 60; // e.g., 60 seconds
        const maxRequests = 5; // e.g., 100 requests per window

        redis
            .multi()
            .incr(key)
            .expire(key, windowSeconds)
            .exec((err, results) => {

            console.log("rate limiter redis:",results)

            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const requestsMade = results[0][1];
            if (requestsMade > maxRequests) {
                return res.status(429).json({ error: 'Rate limit exceeded' });
            }

            // Requests within limit, continue to the next middleware/route handler
            next();
            });
    },

    get_redis: async (path) => {
        try {
            const redis = new Redis();
            const result = await redis.get(path)
            console.log("Redis 取得成功，path：",path,"result：",result)
            return result
        } catch (err) { console.log("Error in redis! msg：", err ) }
    },

    set_redis: (path,data) => {
        try {
            const redis = new Redis();
            redis.set(path, data, 'EX', 3600)
            redis.get(path).then((result) => {
                console.log("Redis 設置成功，path：",path,"result：",result); // Prints "value"
            });
        } catch (err) { console.log("Error in redis! msg：", err ) }
    },

    delete_redis: async (path) => {
        try {
            const redis = new Redis();
            await redis.del(path);
            console.log("Redis 刪除成功，path：", path);
            redis.disconnect();
        } catch (err) { console.log("Error in redis! msg：", err ) }
    }

}