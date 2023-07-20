const mysql = require('mysql2/promise');
const util = require('../utils/util')

const db = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'user'
});

module.exports = {
    postRequest: async(res,friend_id,my_id) => {
        console.log("測試postRequest：朋友id為",friend_id,"我的id為",my_id)
        if(parseInt(my_id) === parseInt(friend_id)){ return res.status(403).json({ error: `You can't send friend request to yourself.` }); }
        try {
            const searchsql = 'SELECT * FROM users WHERE id = ?'
            const [results] = await db.query(searchsql, [friend_id])
            if(results.length === 0){
                return res.status(400).json({ error: 'No user found' });
            }
            const sql_check = 'SELECT status FROM friendship WHERE user_id = ? AND friend_id = ?'
            const [resultsCheck] = await db.query(sql_check,[my_id,friend_id])
            console.log("結果長度：",resultsCheck.length,my_id,friend_id)
            if(resultsCheck.length > 0) { 
                return resultsCheck[0].status === "friend" ? 
                res.status(403).json({  error: `You have already be a friend with this person.` }) : 
                res.status(403).json({  error: `You have already been send a request.` })
            }
            try {
                const sql_friend = 'INSERT INTO friendship (user_id, status, friend_id) VALUES (?,?,?)'
                const [friend_results] = await db.query(sql_friend, [friend_id,'pending',my_id])
                const resultId = friend_results.insertId
                const sql_event = 'INSERT INTO event (user_id,type,summary) VALUES (?,?,?)'
                await db.query(sql_event, [friend_id,'friend_request',`ID ${my_id} invited you to be friends.`])
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
        console.log("測試deleteFriend：朋友id為",id,"我的id為",self_id)
        try {
            const validate_sql = 'SELECT user_id, friend_id FROM friendship WHERE user_id = ? OR friend_id = ?'
            const [results] = await db.query(validate_sql, [self_id,self_id])
            if(results[0] === undefined){
                return res.status(403).json({ error: 'User ID not existed' });
            } else if(results[0].user_id !== id && results[0].friend_id !== id && results[0].user_id !== self_id && results[0].friend_id !== self_id ){
                console.error("要求刪除Request的朋友ID為",id,"自己的ID為",self_id,"，但能同意的只有ID為",results[0].user_id,"或ID為",results[0].friend_id,"的使用者，id為")
                return res.status(400).json({ error: 'This user has no permission to delete friend request'})
            } else {
                const sql = 'DELETE FROM friendship WHERE id = ?'
                await db.query(sql, [id])

                const sqlMinusCount = 'UPDATE users SET friend_count = friend_count - 1 WHERE id = ? AND id = ?'
                await db.query(sqlMinusCount, [id,se])
                res.status(200).json({
                    data: {
                        friendship: {
                            id: id
                        }
                    }
                });
            }
        } catch (error) {
            return util.databaseError(error,'deleteFriend',res);
        }
    },
    postAgree: async(res,id,self_id) => {
        // id：朋友表id；self_id：Token ID
        console.log("測試答應好友邀請：資料表PK id為",id,"，我自己的ID為",self_id)
        try {
            const validate_sql = 'SELECT user_id, friend_id FROM friendship WHERE id = ?'
            const [results] = await db.query(validate_sql, [id])
            console.log("測試答應好友，回傳結果：",results,results[0])
            if(results[0] === undefined){
                return res.status(403).json({ error: 'User ID not existed' });
            } else if(results[0].user_id !== self_id){
                console.error("要求同意Request的ID為",self_id,"，但能同意的只有ID為",results[0].user_id,"的使用者，id為",id)
                return res.status(400).json({ error: 'This user has no permission to agree friend request'})
            } else {
                const friend_id = results[0].friend_id
                const sqlUpdate = 'UPDATE friendship SET status = ? WHERE id = ?'
                await db.query(sqlUpdate, ['friend',id])

                const sqlInsert = 'INSERT INTO event (user_id,type,summary,created_at) VALUES (?,?,?,?)'
                const eventTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
                await db.query(sqlInsert, [friend_id,'friend_request',`ID ${friend_id} has accepted your friend request.`,eventTime])

                const sqlAddCount = 'UPDATE users SET friend_count = friend_count + 1 WHERE id = ?'
                await db.query(sqlAddCount, [id])

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
                console.log("測試getFriends取資料：",friend_id, name, picture, id, status)
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
                console.log("測試getPending取資料：",result)
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
