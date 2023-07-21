const Redis = require("ioredis");

module.exports = {

    get_redis: async (path) => {
        const redis = new Redis();
        console.log("Redis讀取路徑：",path)
        const result = await redis.get(path)
        return result
    },

    set_redis: (path,data) => {
        try {
            const redis = new Redis();
            redis.set(path, data, 'EX', 3600)
            redis.get(path).then((result) => {
                console.log("Redis 設置成功，paht：",path,"result：",result); // Prints "value"
            });
        } catch (err) { console.log("Error in redis! msg：", err ) }
    }

}