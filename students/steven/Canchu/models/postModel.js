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
        console.error('Function:createPost')
        const userSql = 'SELECT name FROM users WHERE id = ?'
        db.query(userSql, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            const name = results[0].name
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
    createLike: async(res,id,post_id) => {
        console.error('Function:createLike')
        const sql = 'INSERT INTO postlike (user_id, post_id) VALUES (?,?)';
        db.query(sql, [id, post_id], (error, results) => {
            console.log("Insert user_id",id," and post_id ",post_id," into post like table")
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            } else {
                const postSql = 'UPDATE post SET like_count = like_count + 1 WHERE id = ?'
                db.query(postSql, [post_id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Server error' });
                    } else {
                        const response = {
                            data: {
                                post: {
                                    id: id
                                }
                            },
                        };
                        return res.status(200).json(response);
                    }
                })     
            }
        })
    },
    createComment: async(res,id,post_id,content) => {
        console.error('Function:createComment')
        const sql = 'INSERT INTO postcomment (user_id, post_id, text) VALUES (?,?,?)'
        db.query(sql, [id, post_id, content], (error, results) => {
            console.log("Insert user_id",id," and post_id ",post_id," and comment ",content," into post comment table")
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            } else {
                const comment_id = results.insertId
                const postSql = 'UPDATE post SET comment_count = comment_count + 1 WHERE id = ?'
                console.log("測試：",postSql)
                db.query(postSql, [post_id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Server error' });
                    } else {
                        const response = {
                            data: {
                                post: {
                                    id: id
                                },
                                comment: {
                                    id: comment_id
                                }
                            },
                        };
                        return res.status(200).json(response);
                    }
                })   
            }
        })
    },
    deleteLike: async(res,id,post_id) => {
        console.error('Function:deleteLike')
        const sql = 'DELETE FROM postlike WHERE user_id = ? AND post_id = ?';
        db.query(sql, [id, post_id], (error, results) => {
            console.log("Delete user_id",id," and post_id ",post_id," from post table")
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            else {
                const postSql = 'UPDATE post SET like_count = like_count - 1 WHERE id = ?'
                db.query(postSql, [id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Server error' });
                    } else {
                        const response = {
                            data: {
                                post: {
                                    id: id
                                }
                            },
                        };
                        return res.status(200).json(response);
                    }
                })     
            }
        })
    },
    updatePost: async(res,id,post_id,context) => {
        console.error('Function:updatePost')
        const validateSql = 'SELECT user_id FROM post WHERE id = ?'
        db.query(validateSql, [post_id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            const user_id = results[0].user_id
            console.log("找到使用者ID為：",user_id, "；發文內容為：",context)
            if(user_id !== id){
                console.error('Database error:', error);
                return res.status(400).json({ error: 'This user has no permission to update post' });
            } else {
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
        })
    },
    getDetail: async(res,user_id,post_id) => {
        console.log('Function:getDetail')
        const sql = "SELECT id, created_at, context, like_count, comment_count, picture, name FROM post WHERE id = ?"
        db.query(sql, [post_id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            } else {
                const { id, created_at, context, like_count, comment_count, picture, name } = results[0];
                console.log("第一層確認：",results[0],id, created_at, context, like_count, comment_count, picture, name)
                const likedSql = "SELECT COUNT(*) AS is_liked FROM postlike WHERE user_id = ? AND post_id = ?"
                db.query(likedSql, [id,post_id], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Server error' });
                    } else {
                        const count = results[0]
                        console.log("第二層確認：",count,results)
                        const commentSql = "SELECT postcomment.id, postcomment.text, postcomment.created_at AS comment_created_at, users.id AS user_id , users.name, users.picture FROM postcomment LEFT JOIN users ON postcomment.user_id = users.id WHERE user_id = ? AND post_id = ?"
                        db.query(commentSql, [user_id,post_id], (error, results) => {
                            if (error) {
                                console.error('Database error:', error);
                                return res.status(500).json({ error: 'Server error' });
                            } else {
                                console.log("第三層：",results)
                                const commentList = results.map((result) => {
                                    const { id, text, comment_created_at, user_id, name, picture } = result
                                    console.log("結果：",result)
                                    return {
                                        id: id,
                                        created_at : comment_created_at,
                                        content: text,
                                        user : {
                                            id: user_id,
                                            name: name,
                                            picture: picture
                                        }
                                    };
                                })
                                console.log("第四層",commentList)
                                const response = {
                                    data: {
                                            post: {
                                                id: post_id,
                                                created_at: created_at,
                                                context: context,
                                                is_liked: count == 1 ? true : false,
                                                like_count: like_count,
                                                comment_count: comment_count,
                                                picture: picture,
                                                name: name,
                                                comments: commentList
                                            }
                                    },
                                };
                                console.log("取得Detail：",commentList,response)
                                return res.status(200).json(response);
                            }
                        })        
                        
                    }
                })
            }
        })
    }
}
