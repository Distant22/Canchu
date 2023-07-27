const Redis = require("ioredis");

module.exports = {

    rateLimiter: async (req, res, next) => {

        var ip = req.headers['x-forwarded-for'];
        if (!ip) {
            console.log("The illegal IP:",ip)
            return res.status(403).json({ error: 'Illegal access' });
        } else {
            console.log("The IP:",ip)
        }

        try {

            const redis = new Redis();
            var redis_result = JSON.parse(await redis.get(`${ip}`))
            var violate_result = JSON.parse(await redis.get(`${ip}_banned`))

            if(redis_result > 10 || violate_result){

                redis.set(`${ip}_banned`, 0, 'EX', 10)
                return res.status(429).json({ error: 'You exceed your rate limit.' });

            } else if(redis_result){ 

                redis.incr(`${ip}`, (err, newCount) => {
                    if (err) {
                      console.error('Error incrementing counter:', err);
                    } else {
                      console.log(`New count:${newCount}`)
                    }
                });

            } else {

                redis.set(`${ip}`, 1, 'EX', 10)
                console.error(`Set New ${ip} Redis to 1`);

            }
            next();

        } catch (err) {

            console.error("Error：",err)
            res.status(500).json({ error: 'Redis Error' });
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

    set_redis: (path,data,expireTime) => {
        try {
            const redis = new Redis();
            redis.set(path, data, 'EX', expireTime)
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