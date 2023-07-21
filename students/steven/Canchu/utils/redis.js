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

    set_redis: async (path,data,res) => {
        try {
            const redis = new Redis();
            await redis.set(path, data, 'EX', 3600)
            console.log(await redis.hGetAll(path))
        } catch (err) { console.log("Error in redis! msg：", err ) }
    }

}