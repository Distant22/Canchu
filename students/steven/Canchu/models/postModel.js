const mysql = require('mysql');
const bcrypt = require('bcrypt');
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
	console.log('Event Model：Connected to MySQL database');
});

module.exports = {
    createPost: async(res,id,context) => {
        const userSql = 'SELECT name FROM users WHERE id = ?'
        db.query(userSql, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            const name = results
            const postTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            console.log("找到使用者名稱為：",name,"；發文內容為",context)
            const sql = 'INSERT INTO post ( user_id, created_at, context, name ) VALUES (?,?,?,?)';
            db.query(sql, [id, postTime, context, name], (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log("發文id",results.insertId)
                const response = {
                    data: {
                        post: {
                            id: results.insertId
                        }
                    },
                };
                return res.status(200).json(response);
            })
        })
    },
    updatePost: async(res,id,post_id,context) => {
        const validateSql = 'SELECT user_id FROM post WHERE id = ?'
        db.query(validateSql, [context, post_id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            const user_id = results
            console.log("找到使用者ID為：",user_id, results.user_id,"；發文內容為：",context)
            if(user_id !== id){
                console.error('Database error:', error);
                return res.status(400).json({ error: 'This user has no permission to update post' });
            }
        })
        const sql = 'UPDATE post SET context = ? WHERE id = ?';
        db.query(sql, [context, post_id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            console.log("更新發文id",post_id)
            const response = {
                data: {
                    post: {
                        id: post_id
                    }
                },
            };
            return res.status(200).json(response);
        })
    }
}
