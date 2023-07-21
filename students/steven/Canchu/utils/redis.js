const Redis = require("ioredis");

module.exports = {

    get_redis: async (path) => {
        try {
            const redis = new Redis();
            console.log("Redis 新增路徑：",path)
            const result = await redis.get(path)
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

    delete_redis: (path) => {
        try {
            const redis = new Redis();
            redis.del(path).then((result) => {
                console.log("Redis 刪除成功，paht：",path); 
            })
        } catch (err) { console.log("Error in redis! msg：", err ) }
    }

}