const Redis = require("ioredis");

module.exports = {

    rateLimiter: async (req, res, next) => {
        const redis = new Redis();
        const clientIP = req.ip;
      
        const key = `rate_limiter:${clientIP}`;
        const windowSeconds = 1; // e.g., 1 seconds
        const maxRequests = 10; // e.g., 10 requests per window
      
        try {
          const results = await redis.watch(key); // Start watching the key
          console.log("Redis watch result:",results,req.ip)
      
          const currentValue = await redis.get(key);
          const requestsMade = currentValue ? parseInt(currentValue) : 0;
      
          console.log("Request數量為",requestsMade,"最大限制為",maxRequests)

          if (requestsMade >= maxRequests) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
          }
      
          const transaction = redis.multi();
          transaction.incr(key); // Increment the counter
          transaction.expire(key, windowSeconds); // Set the expiration time
          const transactionResult = await transaction.exec();
      
          if (transactionResult === null) {
            // The key was modified by another client before the transaction could be executed.
            // Handle this scenario, e.g., retry the rateLimiter function or return an error response.
            console.error('Concurrent modification of key detected');
            return res.status(500).json({ error: 'Concurrent modification of key detected' });
          }
      
          // Requests within limit, continue to the next middleware/route handler
          next();
        } catch (err) {
          console.error('Redis error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        } finally {
          redis.disconnect(); // Disconnect the Redis client after the request is processed
        }
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