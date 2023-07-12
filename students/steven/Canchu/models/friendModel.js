const mysql = require('mysql');
const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('../utils/util')

const db = mysql.createConnection({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'user'
});

db.connect((err) => {
	if (err) {
		throw err;
	}
	console.log('Friend Model：Connected to MySQL database');
});

module.exports = {
    postRequest: async(res,my_id,friend_id) => {
        const searchsql = 'SELECT * FROM users WHERE id = ?'
        db.query(searchsql, [my_id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            if(results.length === 0){
                return res.status(400).json({ error: 'No user found' });
            }
            const sql_friend = 'INSERT INTO friendship (user_id, status, friend_id) VALUES (?,?,?)'
            db.query(sql_friend, [my_id,'pending',friend_id], (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Server error' });
                } else {

                    const resultId = results.insertId
		    const sql_event = 'INSERT INTO event (user_id,type,summary) VALUES (?,?,?)'
                    db.query(sql_event, [my_id,'friend_request',`ID ${friend_id} invited you to be friends.`], (error, results) => {
                        if (error) {
                            console.error('Database error:', error);
                            return res.status(500).json({ error: 'Server error' });
                        } else {
                            
                        }
                        res.status(200).json({
                            data: {
                                friendship: {
                                    id: resultId
                                }
                            }
                        });
                    })
                }
            })
        })
    },
    deleteFriend: async(res,id,self_id) => {
        const validate_sql = 'SELECT user_id, friend_id FROM friendship WHERE id = ?'
        db.query(validate_sql, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            if(results[0].user_id !== self_id && results[0].friend_id !== self_id){
                console.error("要求刪除Request的ID為",self_id,"，但能同意的只有ID為",results[0].user_id,"或ID為",results[0].friend_id,"的使用者，id為",id)
		        return res.status(400).json({ error: 'This user has no permission to agree friend request'})
            } else {
                console.log("通過。接下來...")
                const sql = 'DELETE FROM friendship WHERE id = ?'
                db.query(sql, [id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Server error' });
                    }
                    res.status(200).json({
                        data: {
                            friendship: {
                                id: id
                            }
                        }
                    });
                })
            }
        })
    },
    postAgree: async(res,id,self_id) => {
        const validate_sql = 'SELECT user_id, friend_id FROM friendship WHERE id = ?'
        db.query(validate_sql, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
	    }
	    console.log("印出來：",id,results,results[0])
            if(results[0].user_id !== self_id){
                console.error("要求同意Request的ID為",self_id,"，但能同意的只有ID為",results[0].user_id,"的使用者，id為",id)
		        return res.status(400).json({ error: 'This user has no permission to agree friend request'})
            } else {
                const friend_id = results[0].friend_id
                console.log("測試朋友ID：",friend_id)
                const sql = 'UPDATE friendship SET status = ? WHERE id = ?'
                db.query(sql, ['friend',id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Server error' });
                    } else {
                        const sql = 'INSERT INTO event (user_id,type,summary) VALUES (?,?,?)'
                        db.query(sql, [friend_id,'friend_request',`ID ${friend_id} has accepted your friend request.`], (error, results) => {
                            if (error) {
                                console.error('Database error:', error);
                                return res.status(500).json({ error: 'Server error' });
                            } else {
                                res.status(200).json({
                                    data: {
                                        friendship: {
                                            id: id
                                        }
                                    }
                                });
                            }
                        })
                    }
                })
            }
        })
    },
    getPending: async(res, user_id) => {
        const sql = 'SELECT friendship.friend_id, users.name, users.picture, friendship.id, friendship.status FROM users INNER JOIN friendship ON users.id = friendship.friend_id WHERE friendship.user_id = ?'
        db.query(sql, [user_id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
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
            res.status(200).json({
                data: {
                    users: pendingList
                }
            });
        })
    }
}
