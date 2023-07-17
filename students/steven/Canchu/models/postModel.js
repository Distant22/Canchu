const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const util = require('../utils/util')

const db = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'user'
});

module.exports = {
    createPost: async (res, id, context) => {
        console.error('Function: createPost');
        try {
            // Get User Name from Token
            const userSql = 'SELECT name FROM users WHERE id = ?';
            const [results] = await db.query(userSql, [id]) ;
            const name = results[0].name
            // Insert Post Details into post table
            const postTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const sql ='INSERT INTO post (user_id, created_at, context, name) VALUES (?, ?, ?, ?)';
            const [postResults] = await db.query(sql, [id, postTime, context, name]);
            const insertId = postResults.insertId
            // Response ID
            const response = {
                data: {
                    post: {
                        id: insertId,
                    },
                },
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'createPost',res);
        }
    },
    createLike: async(res,id,post_id) => {
        console.error('Function:createLike')
        try {
            // Insert userID and postID into postlike table
            const sql = 'INSERT INTO postlike (user_id, post_id) VALUES (?,?)';
            await db.query(sql, [id, post_id]);
            // Update like count in post table
            const postSql = 'UPDATE post SET like_count = like_count + 1 WHERE id = ?'
            await db.query(postSql, [post_id]);
            // Response ID
            const response = {
                data: {
                    post: {
                        id: id
                    }
                },
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'createLike',res);
        }
    },
    createComment: async(res,id,post_id,content) => {
        try {
            // Insert userID, postID, comment and time into postcomment table
            const sql = 'INSERT INTO postcomment (user_id, post_id, text, created_at) VALUES (?,?,?,?)'
            const commentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const [results] = await db.query(sql, [id, post_id, content, commentTime]);
            // Update comment count in post table
            const comment_id = results.insertId
            const postSql = 'UPDATE post SET comment_count = comment_count + 1 WHERE id = ?'
            await db.query(postSql, [post_id]);
            // Response ID and commentID
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
        } catch (error) {
            return util.databaseError(error,'createComment',res);
        }
    },
    deleteLike: async(res,id,post_id) => {
        try {
            // Delete rows that contains given ID in postlike table
            const sql = 'DELETE FROM postlike WHERE user_id = ? AND post_id = ?';
            await db.query(sql, [id, post_id]);
            // Update like count in post table
            const postSql = 'UPDATE post SET like_count = like_count - 1 WHERE id = ?'
            await db.query(postSql, [id]);
            // Response ID
            const response = {
                data: {
                    post: {
                        id: id
                    }
                },
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'deleteLike',res);
        }
    },
    updatePost: async(res,id,post_id,context) => {
        try {
            // Get user ID given post ID in post table
            const validateSql = 'SELECT user_id FROM post WHERE id = ?'
            const [results] = await db.query(validateSql, [post_id])
            const user_id = results[0].user_id
            // Validate Permission
            if(user_id !== id){ 
                return res.status(400).json({ error: 'This user has no permission to update post' });
            } else {
                // Update post to given content on specified post ID
                const sql = 'UPDATE post SET context = ? WHERE id = ?';
                await db.query(sql, [context, post_id])
                // Response post ID
                const response = {
                    data: {
                            post: {
                                id: post_id
                            }
                    },
                };
                return res.status(200).json(response);
            }
        } catch (error) {
            return util.databaseError(error,'updatePost',res);
        }
    },
    getDetail: async(res,post_id) => {
        console.log('Function:getDetail')
        try {
            // Select required information from post table given post ID
            const sql = "SELECT id, created_at, context, like_count, comment_count, picture, name FROM post WHERE id = ?"
            const [results] = await db.query(sql, [post_id])
            const { id, created_at, context, like_count, comment_count, picture, name } = results[0];
            // Select like count from postlike table given user ID and post ID
            const likedSql = "SELECT COUNT(*) AS is_liked FROM postlike WHERE user_id = ? AND post_id = ?"
            const [count] = await db.query(likedSql, [id,post_id])
            // Select needed user and comment information from join table given user ID and post ID
            const commentSql = "SELECT postcomment.id, postcomment.text, postcomment.created_at AS comment_created_at, users.id AS user_id , users.name, users.picture FROM postcomment LEFT JOIN users ON postcomment.user_id = users.id WHERE post_id = ?"
            const [results_join] = await db.query(commentSql, [post_id])
            // Map the results
            const commentList = results_join.map((result) => {
                const { id, text, comment_created_at, user_id, name, picture } = result
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
            // Response the post object containing comments and users information
            const response = {
                data: {
                        post: {
                            id: parseInt(post_id,10),
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
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'getDetail',res);
        }
    },
    getSearch: async(res,token_id,user_id, cursor) =>  {
        console.log('Function:getSearch')
        try {
            const decode_cursor = cursor === undefined ? 0 : Number(Buffer.from(cursor, 'base64').toString('ascii'))
            console.log("解碼後的Cursor：",decode_cursor,"傳入的User_ID和Token_ID：",user_id,token_id)
            // 如果有沒有ID：回傳自己的文章
            const sql = (user_id === undefined) ? 
            `WITH my_post AS (
                SELECT
                    (SELECT COUNT(*) FROM post WHERE user_id = ?) AS count,
                    id, created_at, context, like_count, comment_count, picture, name
                FROM
                    post
                WHERE
                    user_id = ?
            ),
            friend_search AS (
                SELECT 
                    f.user_id, f.friend_id 
                FROM 
                    friendship AS f
                WHERE (f.user_id = ? AND f.status = 'friend') OR (f.status = 'friend' AND f.friend_id = ?) 
            ),
            friend_post AS (
                SELECT
                    (SELECT COUNT(*) FROM post WHERE user_id = ?) AS count,
                    p.id, p.created_at, p.context, p.like_count, p.comment_count, p.picture, p.name
                FROM
                    post AS p
                WHERE
                    p.user_id IN (
                        SELECT user_id FROM friend_search
                        UNION
                        SELECT friend_id FROM friend_search
                    )
            )
            SELECT
                mp.id, mp.created_at, mp.context, mp.like_count, mp.comment_count, mp.picture, mp.name
            FROM
                my_post AS mp UNION
            SELECT
                fp.id, fp.created_at, fp.context, fp.like_count, fp.comment_count, fp.picture, fp.name
            FROM
                friend_post AS fp
            LIMIT 10 OFFSET ?`
             : 
            "SELECT (SELECT COUNT(*) FROM post WHERE user_id = ?) AS count, id, created_at, context, like_count, comment_count, picture, name FROM post WHERE user_id = ? LIMIT 10 OFFSET ?"
            var [results] = (user_id === undefined) ? await db.query(sql,[token_id,token_id,token_id,token_id,token_id,decode_cursor]) : await db.query(sql, [user_id,user_id,decode_cursor])
            console.log("結果樣子：",results)
            const count = results[0] === undefined ? 0 : results[0].count
            var next_cursor = null
            if(count - decode_cursor > 10){
                next_cursor = Buffer.from((decode_cursor+10).toString(), 'ascii').toString('base64');
            }
            const postList = results[0] === undefined ? [] : results.map((result) => {
                const { count, id, created_at, context, like_count, comment_count, picture, name } = result;
                console.log("取result:",result)
                return {
                    id: id,
                    created_at : created_at,
                    content: context,
                    like_count: like_count,
                    comment_count: comment_count,
                    picture: picture,
                    name: name
                };
            })
            const response = {
                data: {
                    posts: postList,
                    next_cursor: next_cursor
                }
            }
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'getSearch',res);
        }
    }
}
