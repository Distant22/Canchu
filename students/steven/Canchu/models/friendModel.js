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
    postRequest: async(res,user_id,req_user_id) => {
        const searchsql = 'SELECT * FROM users WHERE id = ?'
        db.query(searchsql, [user_id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            if(results.length === 0){
                return res.status(400).json({ error: 'No user found' });
            }
            const sql = 'INSERT INTO friendship (user_id, status, friend_id) VALUES (?,?,?)'
            db.query(sql, [user_id,'pending',req_user_id], (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Server error' });
                }
                res.status(200).json({
                    data: {
                        friendship: {
                            id: user_id
                        }
                    }
                });
            })
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
                console.log("測試取資料：",result)
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