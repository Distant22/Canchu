const mysql = require('mysql2/promise');
const util = require('../utils/util')
const redis = require('../utils/redis')

const db = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'user'
});

module.exports = {
    postRequest: async(res,friend_id,my_id) => {
        if(parseInt(my_id) === parseInt(friend_id)){ return res.status(403).json({ error: `You can't send friend request to yourself.` }); }
        try {
            const searchsql = 'SELECT * FROM users WHERE id = ?'
            const [results] = await db.query(searchsql, [friend_id])
            if(results.length === 0){
                return res.status(400).json({ error: 'No user found' });
            }
            const sql_check = 'SELECT status FROM friendship WHERE user_id = ? AND friend_id = ?'
            const [resultsCheck] = await db.query(sql_check,[my_id,friend_id])
            if(resultsCheck.length > 0) { 
                return resultsCheck[0].status === "friend" ? 
                res.status(403).json({  error: `You have already be a friend with this person.` }) : 
                res.status(403).json({  error: `You have already been send a request.` })
            }
            try {
                const sql_friend = 'INSERT INTO friendship (user_id, status, friend_id) VALUES (?,?,?)'
                const [friend_results] = await db.query(sql_friend, [friend_id,'pending',my_id])
                const resultId = friend_results.insertId
                const sql_event = 'INSERT INTO event (user_id,type,summary,created_at) VALUES (?,?,?,?)'
                const eventTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
                await db.query(sql_event, [friend_id,'friend_request',`${results[0].name} invited you to be friends.`,eventTime])
                res.status(200).json({
                    data: {
                        friendship: {
                            id: resultId
                        }
                    }
                })
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.error('Duplicate Request Error', error.code);
                    return res.status(403).json({ error: 'You have already send a request to this person.' });
                } else {
                    util.databaseError(error,'postRequest',res);
                }
            }
        } catch (error) {
            return util.databaseError(error,'postRequest',res);
        }
    },
    deleteFriend: async(res,id,self_id) => {
        // 只能去id那裏刪除朋友；不能刪除自己
        try {
            const validate_sql = 'SELECT user_id, status, friend_id FROM friendship WHERE id = ?'
            const [results] = await db.query(validate_sql, [id])
            if(results === undefined){
                return res.status(403).json({ error: 'User ID not existed' });
            } else if (results[0].user_id !== self_id && self_id !== results[0].friend_id) {
                return res.status(403).json({ error: 'No Permission' }); 
            } else {
                try{
                    if (results[0].status === 'friend'){
                        const sqlMinusCount = 'UPDATE users SET friend_count = friend_count - 1 WHERE id = ? OR id = ?'
                        await db.query(sqlMinusCount, [results[0].friend_id,results[0].user_id])
                    }
                    const sql = 'DELETE FROM friendship WHERE id = ?'
                    await db.query(sql, [id])

                    // 去Redis刪資料 
                    redis.delete_redis(`/${results[0].friend_id}/profile`)
                    redis.delete_redis(`/${results[0].user_id}/profile`)
                    // 去Redis刪資料 

                    res.status(200).json({
                        data: {
                            friendship: {
                                id: id
                            }
                        }
                    });
                } catch (error) {
                    return util.databaseError(error,'deleteFriend',res);
                }
            }
        } catch (error) {
            return util.databaseError(error,'deleteFriend',res);
        }
    },
    postAgree: async(res,id,self_id) => {
        // id：朋友表id；self_id：Token ID
        try {
            const validate_sql = 'SELECT f.user_id, f.friend_id, u.name FROM friendship AS f LEFT JOIN users AS u ON f.user_id = u.id WHERE f.id = ?'
            const [results] = await db.query(validate_sql, [id])
            if(results[0] === undefined){
                return res.status(403).json({ error: 'User ID not existed' });
            } else if(results[0].user_id !== self_id){
                return res.status(400).json({ error: 'This user has no permission to agree friend request'})
            } else {
                const friend_id = results[0].friend_id
                const sqlUpdate = 'UPDATE friendship SET status = ? WHERE id = ?'
                await db.query(sqlUpdate, ['friend',id])

                const sqlInsert = 'INSERT INTO event (user_id,type,summary,created_at) VALUES (?,?,?,?)'
                const eventTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
                await db.query(sqlInsert, [friend_id,'friend_request',`${results[0].name} has accepted your friend request.`,eventTime])

                const sqlAddCount = 'UPDATE users SET friend_count = friend_count + 1 WHERE id = ? OR id = ?'
                await db.query(sqlAddCount, [self_id,friend_id])

                // 去Redis刪資料 
                redis.delete_redis(`/${self_id}/profile`)
                redis.delete_redis(`/${friend_id}/profile`)
                // 去Redis刪資料 

                res.status(200).json({
                    data: {
                        friendship: {
                            id: id
                        }
                    }
                });
            }
        } catch (error) {
            return util.databaseError(error,'postAgree',res);
        }
    },
    getFriends: async(res, user_id) => {
        try {
            const sql = `
            WITH me AS (
                SELECT friendship.friend_id, users.name, users.picture, friendship.id, friendship.status 
                FROM users INNER JOIN friendship 
                ON users.id = friendship.friend_id 
                WHERE friendship.user_id = ? AND friendship.status = 'friend'
            ), friend AS (
                SELECT friendship.user_id, users.name, users.picture, friendship.id, friendship.status 
                FROM users INNER JOIN friendship 
                ON users.id = friendship.user_id 
                WHERE friendship.friend_id = ? AND friendship.status = 'friend'
            )
            SELECT m.friend_id, m.name, m.picture, m.id, m.status FROM me AS m
            UNION
            SELECT f.user_id, f.name, f.picture, f.id, f.status FROM friend AS f
            `
            const [results] = await db.query(sql, [user_id,user_id])
            const friendList = results.map((result) => {
                const {friend_id, name, picture, id, status} = result
                return {
                    id: friend_id,
                    name,
                    picture,
                    friendship:  { 
                        id: id, 
                        status: status
                    }
                };
            })
            return res.status(200).json({
                data: {
                    users: friendList
                }
            });
        } catch (error) {
            return util.databaseError(error,'getFriends',res);
        }
    },
    getPending: async(res, user_id) => {
        try {
            const sql = `
            WITH me AS (
                SELECT friendship.friend_id, users.name, users.picture, friendship.id, friendship.status 
                FROM users INNER JOIN friendship 
                ON users.id = friendship.friend_id 
                WHERE friendship.user_id = ? AND friendship.status = 'pending'
            )
            SELECT m.friend_id, m.name, m.picture, m.id, m.status FROM me AS m
            `
            const [results] = await db.query(sql, [user_id,user_id])
            const pendingList = results.map((result) => {
                const {friend_id, name, picture, id, status} = result
                return {
                    id: friend_id,
                    name,
                    picture,
                    friendship:  { 
                        id: id, 
                        status: status
                    }
                };
            })
            return res.status(200).json({
                data: {
                    users: pendingList
                }
            });
        } catch (error) {
            return util.databaseError(error,'getPending',res);
        }
    }
}
