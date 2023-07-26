const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const util = require('../utils/util')
const redis = require('../utils/redis')
const { db, closeConnection } = require('../utils/util');

const db = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'user'
});

module.exports = {
    // 取得User ID, User name, User picture, Friendship 的主鍵id, Friendship 的status
    search: async(res,keyword) => {
        try {
            const sql = 'SELECT users.id, users.name, users.picture, friendship.id AS friend_id , friendship.status FROM users LEFT JOIN friendship ON users.id = friendship.user_id WHERE users.name LIKE '+`'%${keyword}%'`
            const [results] = await db.query(sql) ;
            const searchList = results.map((result) => {
                const {id, name, picture, friend_id, status} = result
                console.log(id,name,picture,friend_id,status)
                return {
                    id: id,
                    name: name,
                    picture: picture,
                    friendship: friend_id === null ? null : {
                        id: friend_id,
                        status: status
                    }
                };
            })
            return res.status(200).json({
                data: {
                    users: searchList
                }
            })
        } catch (error) {
            return util.databaseError(error,'search',res);
        }
    },
    signin: async(res,email,password,provider) => {
        try {
            const sql = "SELECT * FROM users WHERE email = ?"
            const [resultsCheck] = await db.query(sql, [email]) ;
            if(resultsCheck.length == 0){
                return res.status(403).json({ error: 'Email not exist' });
            } else {
                const userInfo = resultsCheck[0]
                bcrypt.compare(password, userInfo.password).then(function (pwdResult) {
                    if(!pwdResult){
                        return res.status(403).json({ error: 'Incorrect Password' });
                    } else {
                        // 全部包起來做成Token
                        const user = {
                            id: userInfo.id,
                            provider: provider,
                            name: userInfo.name,
                            email: userInfo.email,
                            picture: userInfo.picture,
                            introduction: userInfo.introduction,
                            tags: userInfo.tags,
                            friend_count: userInfo.friend_count
                        }
                        console.log("登入成功。登入資訊為：",user)
                        return res.status(200).json({
                            data: {
                                access_token: util.generateToken(user),
                                user: {
                                    id: user.id,
                                    provider: user.provider,
                                    name: user.name,
                                    email: user.email,
                                    picture: user.picture
                                }
                            }
                        })
                    }
                })
            }
        } catch (error) {
            return util.databaseError(error,'signin',res);
        } finally {
            closeConnection()
        }
    },

    signup: async (res,name,email,password) => {
        try {
            const sqlCheck = 'SELECT COUNT(*) as count FROM users WHERE Email = ?'
            const [resultsCheck] = await db.query(sqlCheck, [email])
            const userCount = resultsCheck[0].count
            if (userCount > 0) {
                // A user with the same email already exists
                console.error('Email Fail!',name,email,password)
                return res.status(403).json({ error: 'Email already exists' });
            } else {
                const hashPwd = bcrypt.hashSync(password, 10);
                const sqlInsert = 'INSERT INTO users (Name, Email, Password, friend_count, introduction, tags, picture) VALUES (?,?,?,?,?,?,?)'
                const [resultsInsert] = await db.query(sqlInsert, [name,email,hashPwd,0,'','',''])
                const resultID = resultsInsert.insertId;
                const user = {
                    id: resultID, 
                    provider: 'native', 
                    name: name, 
                    email: email, 
                    picture: '', 
                    introduction: '', 
                    tags: '', 
                    friend_count: 0
                };
                console.log("User signup success, info=",user)
                res.status(200).json({
                    data: {
                        access_token: util.generateToken(user),
                        user: {
                            id: user.id,
                            provider: user.provider,
                            name: user.name,
                            email: user.email,
                            picture: user.picture,
                        }
                    }
                });
            }
        } catch (error) {
            return util.databaseError(error,'signup',res);
        }
    },

    getProfile: async(res,userId,id) => {
        // userId：要看的人的ID，ID：Token ID
        try {
            
            // 進Redis拿東西
            var redis_result = await redis.get_redis(`/users/${userId}/profile`)
            redis_result = JSON.parse(redis_result)
            // 進Redis拿東西

            const friendsql =  
            `WITH me AS (
                SELECT id,
                CASE WHEN status = 'pending' THEN 'requested' ELSE status END AS status
                FROM friendship WHERE user_id = ? AND friend_id = ?
            ), friend AS (
                SELECT id,
                CASE WHEN status = 'requested' THEN 'pending' ELSE status END AS status
                FROM friendship WHERE friend_id = ? AND user_id = ?
            )
            SELECT m.id, m.status FROM me AS m
            UNION
            SELECT f.id, f.status FROM friend AS f;            
            `
            const [resultFriend] = await db.query(friendsql, [userId,id,userId,id])
            const friendshipData = resultFriend.length === 0 ? null : resultFriend.map(friendship => ({
                id: friendship.id,
                status: friendship.status
            }));

            var userProfile = null
            if (!redis_result) { 
                
                const sql = 'SELECT id, name, picture, friend_count, introduction, tags FROM users WHERE id = ?';
                const [results] = await db.query(sql, [userId])
                if (results.length === 0) {
                    return res.status(400).json({ error: 'User not found' });
                }
                userProfile = results[0];
                console.log("Redis 沒東西，直接去資料庫拿，ID為",userId,"Result回傳：",userProfile)

                // 去 Redis 新增資料
                redis.set_redis(`/users/${userId}/profile`,JSON.stringify(userProfile),res)
                // 去 Redis 新增資料
            } 

            const response = {
                data: {
                    user: redis_result ? 
                    {
                        id: redis_result.id,
                        name: redis_result.name,
                        picture: redis_result.picture,
                        friend_count: redis_result.friend_count,
                        introduction: redis_result.introduction,
                        tags: redis_result.tags,
                        friendship: friendshipData === null ? friendshipData : friendshipData[0]
                    } :
                    {
                        id: userProfile.id,
                        name: userProfile.name,
                        picture: userProfile.picture,
                        friend_count: userProfile.friend_count,
                        introduction: userProfile.introduction,
                        tags: userProfile.tags,
                        friendship: friendshipData === null ? friendshipData : friendshipData[0]
                    },
                },
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'getProfile',res);
        }
    },

    updateProfile: async (res,name,introduction,tags,id) => {
        try {
            const sql_validate = 'SELECT COUNT(*) as count FROM users WHERE id = ?'
            const [resultsCheck] = await db.query(sql_validate, [id])
            if (resultsCheck[0].count === 0) {
                return res.status(400).json({ error: 'User not found' });
            } else {
                const sql = 'UPDATE users SET name = ? , introduction = ? , tags = ? WHERE id = ?'
                await db.query(sql, [name, introduction, tags, id])

                // 去Redis刪資料 
                await redis.delete_redis(`/users/${id}/profile`)
                // 去Redis刪資料 

                const response = {
                    data: {
                        user: {
                            id: id,
                        },
                    },
                };
                return res.status(200).json(response);
            }
        } catch (error) {
            return util.databaseError(error,'updateProfile',res);
        }
    },

    updatePicture: async (res, picture, id) => {
        try {
            const sql_validate = 'SELECT COUNT(*) as count FROM users WHERE id = ?'
            const [resultsCheck] = await db.query(sql_validate, [id])
            const userCount = resultsCheck[0].count
            if (userCount === 0) {
                return res.status(400).json({ error: 'User not found' });
            } else {

                const sql = 'UPDATE users SET picture = ? WHERE id = ?'
                await db.query(sql, [
                    `https://${process.env.DB_HOST}/static/${picture}`
                , id])

                const sql_postUpdate = 'UPDATE post SET picture = ? WHERE user_id = ?'
                await db.query(sql_postUpdate,[
                    `https://${process.env.DB_HOST}/static/${picture}`
                , id])

                // 去Redis刪資料 
                await redis.delete_redis(`/users/${id}/profile`)
                // 去Redis刪資料 

                const response = {
                    data: {
                        picture: picture
                    },
                };
                return res.status(200).json(response);
            }
        } catch (error) {
            return util.databaseError(error,'updatePicture',res);
        }
    }
}
