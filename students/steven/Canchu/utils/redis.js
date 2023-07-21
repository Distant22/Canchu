const Redis = require("ioredis");

module.exports = {

    get_redis: async (path,res) => {
        const redis = new Redis();
        const result = await redis.get(path,res)

        if (result) {
            console.log("Redis Cache found result!");
            return res.status(200).json(result);
        }
    },

    set_redis: (path,data,res) => {
        try {
            const redis = new Redis();
            redis.set(path, data, 'EX', 3600)
            redis.get(path).then((result) => {
                console.log("Redis 取得成功，result：",result); // Prints "value"
            });
        } catch (err) { console.log("Error in redis! msg：", err ) }
    }

}