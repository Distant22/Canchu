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
          
          next();
        } catch (err) {

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