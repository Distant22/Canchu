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
    createPost: async (res, id, context) => {
        console.error('Function: createPost');
        try {

            // Get User Name from Token
            const userSql = 'SELECT name, picture FROM users WHERE id = ?';
            const [results] = await db.query(userSql, [id]) ;
            const name = results[0].name
            const picture = results[0].picture

            // Insert Post Details into post table
            const postTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const sql ='INSERT INTO post (user_id, created_at, context, picture, name) VALUES (?, ?, ?, ?, ?)';
            const [postResults] = await db.query(sql, [id, postTime, context, picture, name]);
            const insertId = postResults.insertId

            // Response ID
            const response = {
                data: {
                    post: {
                        id: insertId,
                    },
                },
            };

            // 重整一次和朋友的貼文資訊
            var cursor = 0 //0 10 20 30...
            var searchArray = []
            var previousLength = -1

            while (searchArray.length > previousLength){
                var next_list = JSON.parse(await redis.get_redis(`/posts/${id}/${cursor}`))
                previousLength = searchArray.length
                searchArray = [].concat(searchArray, next_list)
                console.log("Redis取得的/posts/",id,"/",cursor,"為",next_list,"，searchArray為",searchArray)
                redis.delete_redis(`/posts/${id}/${cursor}`)
                cursor += 10
            }

            cursor = 0
            while (cursor < searchArray.length) {
                redis.set_redis(`/posts/${id}/${cursor}`,JSON.stringify(searchArray.slice(cursor,cursor+10)))
                console.log("設置：Cursor為",cursor,"Set Redis的Sub array為",searchArray.slice(cursor,cursor+10))
                cursor += 10
            }

            // 重整
            var cursor = 0 //0 10 20 30...
            var searchArray = []
            var previousLength = -1

            while (searchArray.length > previousLength){
                var next_list = JSON.parse(await redis.get_redis(`/posts/self/${id}/${cursor}`))
                previousLength = searchArray.length
                searchArray = [].concat(searchArray, next_list)
                console.log("Redis取得的/posts/self/",id,"/",cursor,"為",next_list,"，searchArray為",searchArray)
                redis.delete_redis(`/posts/self/${id}/${cursor}`)
                cursor += 10
            }

            cursor = 0
            while (cursor < searchArray.length) {
                redis.set_redis(`/posts/self/${id}/${cursor}`,JSON.stringify(searchArray.slice(cursor,cursor+10)))
                console.log("設置：Cursor為",cursor,"Set Redis的Sub array為",searchArray.slice(cursor,cursor+10))
                cursor += 10
            }

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

            // 去Redis刪資料 
            redis.delete_redis(`/posts/${post_id}`)
            // 去Redis刪資料 

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
            
            // 去Redis刪資料 
            redis.delete_redis(`/posts/${post_id}`)
            // 去Redis刪資料 

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
            await db.query(postSql, [post_id]);

            // 去Redis刪資料 
            redis.delete_redis(`/posts/${post_id}`)
            // 去Redis刪資料 

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

                // 去Redis刪資料 
                redis.delete_redis(`/posts/${post_id}`)
                // 去Redis刪資料 

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
    getDetail: async(res,post_id,my_id) => {
        console.log('Function:getDetail,參數：',my_id,post_id)
        try {

            var get_result = null

            // 進Redis拿東西
            var redis_result = await redis.get_redis(`/posts/${post_id}`)
            redis_result = JSON.parse(redis_result)
            // 進Redis拿東西

            // 取得留言
            const commentSql = "SELECT postcomment.id, postcomment.text, DATE_FORMAT(postcomment.created_at, '%Y-%m-%d %H:%i:%s') AS comment_created_at, users.id AS user_id , users.name, users.picture FROM postcomment LEFT JOIN users ON postcomment.user_id = users.id WHERE post_id = ?"
            const [results_join] = await db.query(commentSql, [post_id])
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

            if (redis_result === null){
                // Select required information from post table given post ID
                const sql = "SELECT id, user_id, created_at, context, like_count, comment_count, picture, name FROM post WHERE id = ?"
                const [results] = await db.query(sql, [post_id])
                const { user_id, created_at, context, like_count, comment_count, picture, name } = results[0];
                // Select like count from postlike table given user ID and post ID
                const likedSql = "SELECT COUNT(*) AS is_liked FROM postlike WHERE user_id = ? AND post_id = ?"
                const [count] = await db.query(likedSql, [my_id,post_id])
                // Select needed user and comment information from join table given user ID and post ID

                // 去 Redis 新增資料
                const get_result = {
                    id: parseInt(post_id,10),
                    user_id: user_id,
                    created_at: created_at,
                    context: context,
                    is_liked: parseInt(count[0].is_liked) === 1 ? true : false,
                    like_count: like_count,
                    comment_count: comment_count,
                    picture: picture,
                    name: name
                }
                redis.set_redis(`/posts/${post_id}`,JSON.stringify(get_result),res)
                // 去 Redis 新增資料

                console.log("get_result的內容",get_result)
            }

            console.log("Redis_Result的內容：",redis_result)

            var response = get_result === null ? {
                data: {
                        post: {
                            id: redis_result.id,
                            user_id: redis_result.user_id,
                            created_at: redis_result.created_at,
                            context: redis_result.context,
                            is_liked: redis_result.is_liked,
                            like_count: redis_result.like_count,
                            comment_count: redis_result.comment_count,
                            picture: redis_result.picture,
                            name: redis_result.name,
                            comments: commentList
                        }
                },
            } : {
                data: {
                    post: {
                        id: get_result.id,
                        user_id: get_result.user_id,
                        created_at: get_result.created_at,
                        context: get_result.context,
                        is_liked: get_result.is_liked,
                        like_count: get_result.like_count,
                        comment_count: get_result.comment_count,
                        picture: get_result.picture,
                        name: get_result.name,
                        comments: commentList
                    }
                },
            }

            return res.status(200).json(response);

        } catch (error) {
            return util.databaseError(error,'getDetail',res);
        }
    },
    getSearch: async(res,token_id,user_id, cursor) =>  {
        try {

            const decode_cursor = cursor === undefined ? 0 : Number(Buffer.from(cursor, 'base64').toString('ascii'))
            
            // 如果沒有ID：回傳自己的文章
            var redis_Array = user_id === undefined ? 
            await redis.get_redis(`/posts/${token_id}/${decode_cursor}`) :    // /posts/${token_id}/${decode_cursor} 放自己和朋友的文章
            await redis.get_redis(`/posts/self/${user_id}/${decode_cursor}`)  // /posts/self/${user_id} 只放自己的文章
            
            if(redis_Array !== null) {

                redis_Array = JSON.parse(redis_Array)

                var posts = [] //把文章放進 posts

                for(let i = 0 ; i < redis_Array.length ; i++) {

                    var single_post = await redis.get_redis(`/posts/${redis_Array[i]}`)

                    if(single_post === null) {

                        console.log("文章ID",redis_Array[i],"為Null，去資料庫找")
                        const sql = `
                        SELECT 
                            p.id, p.user_id, p.created_at, p.context, p.like_count, p.comment_count, p.picture, p.name, 
                            (CASE 
                                WHEN EXISTS (
                                    SELECT 1 FROM postlike AS pl WHERE pl.user_id = ? AND pl.post_id = p.id
                                ) THEN 1 ELSE 0
                            END) AS is_liked
                        FROM post AS p 
                        WHERE p.id = ?
                        `
                        const [results] = await db.query(sql, [
                            user_id === undefined ? token_id : user_id,
                            redis_Array[i]
                        ])
                        const post = results[0] 
                        const formatted_created_at = new Date(post.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZone: 'UTC',
                        });

                        single_post = {
                            id: post.id,
                            user_id: post.user_id,
                            created_at: formatted_created_at,
                            context: post.context,
                            is_liked: post.is_liked === 1 ? true : false,
                            like_count: post.like_count,
                            comment_count: post.comment_count,
                            picture: post.picture,
                            name: post.name
                        };

                        console.log("迴圈重新拿文章的結果為",single_post)
                        posts.push(single_post)

                    } else {
                        console.log("迴圈有文章的結果為",single_post)
                        posts.push(JSON.parse(single_post))
                    }
                }

                console.log("取得Redis的Search Result文章為",posts)

                return res.status(200).json({
                    data: {
                        posts: posts,
                        next_cursor: (redis_Array.length - parseInt(decode_cursor) > 10) ? Buffer.from((decode_cursor+10).toString(), 'ascii').toString('base64') : null
                    }
                });

            } else {

                const sql = (user_id === undefined) ? 
                `WITH my_post AS (
                    SELECT id, user_id, created_at, context, like_count, comment_count, picture, name
                    FROM post
                    WHERE user_id = ?
                ),
                friend_search AS (
                    SELECT f.user_id, f.friend_id 
                    FROM friendship AS f
                    WHERE (f.user_id = ? AND f.status = 'friend') OR (f.status = 'friend' AND f.friend_id = ?) 
                ),
                friend_post AS (
                    SELECT p.id, p.user_id, p.created_at, p.context, p.like_count, p.comment_count, p.picture, p.name
                    FROM post AS p 
                    WHERE
                        p.user_id IN (
                        SELECT user_id FROM friend_search
                        UNION
                        SELECT friend_id FROM friend_search
                    )
                )
                SELECT 
                    mp.id, mp.user_id, mp.created_at, mp.context, mp.like_count, mp.comment_count, mp.picture, mp.name, 
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM postlike AS pl WHERE pl.user_id = ? AND pl.post_id = mp.id
                        ) THEN 1 ELSE 0
                    END AS is_liked
                FROM
                    my_post AS mp LEFT JOIN postlike AS pl ON mp.user_id = pl.user_id
                GROUP BY
                    mp.id, mp.user_id, mp.created_at, mp.context, mp.like_count, mp.comment_count, mp.picture, mp.name, is_liked
                UNION
                SELECT
                    fp.id, fp.user_id, fp.created_at, fp.context, fp.like_count, fp.comment_count, fp.picture, fp.name,
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM postlike AS pl WHERE pl.user_id = ? AND pl.post_id = fp.id
                        ) THEN 1 ELSE 0
                    END AS is_liked
                FROM
                    friend_post AS fp LEFT JOIN postlike AS pl ON fp.user_id = pl.user_id
                GROUP BY
                    fp.id, fp.user_id, fp.created_at, fp.context, fp.like_count, fp.comment_count, fp.picture, fp.name, is_liked
                ORDER BY created_at DESC
                `
                : 
                `
                SELECT 
                    p.id, p.user_id, p.created_at, p.context, p.like_count, p.comment_count, p.picture, p.name, 
                    (CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM postlike AS pl WHERE pl.user_id = ? AND pl.post_id = p.id
                        ) THEN 1 ELSE 0
                    END) AS is_liked
                FROM post AS p 
                WHERE p.user_id = ?
                ORDER BY created_at DESC
                `
                var [results] = (user_id === undefined) ? 
                await db.query(sql,[token_id,token_id,token_id,token_id,token_id]) : 
                await db.query(sql, [token_id,user_id])

                const limitResults = results[0] === undefined ? [] : 
                results.length - decode_cursor >= 10 ?  
                results.slice(decode_cursor, decode_cursor+10) : 
                results.slice(decode_cursor, results.length) 

                console.log('檢查：',typeof limitResults,results[0],results.length,decode_cursor)

                var redis_arr = []

                const postList = limitResults.map((result) => {

                    const { id, user_id, created_at, context, like_count, comment_count, picture, name, is_liked } = result;

                    redis_arr.push(id)

                    // Format the date as "YYYY-MM-DD HH:mm:ss"
                    const formatted_created_at = new Date(created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZone: 'UTC',
                    });

                    var post = {
                        id: id,
                        user_id: user_id,
                        created_at: formatted_created_at,
                        context: context,
                        is_liked: is_liked === 1 ? true : false,
                        like_count: like_count,
                        comment_count: comment_count,
                        picture: picture,
                        name: name
                    };

                    redis.set_redis(`/posts/${id}`,JSON.stringify(post))

                    return post
                })

                console.log("PostList為",postList,"型態為",typeof postList,"user_id為",user_id)
                // 去 Redis 新增資料
                if (user_id === undefined) {
                    redis.set_redis(`/posts/${token_id}/${decode_cursor}`,JSON.stringify(redis_arr))
                } else {
                    redis.set_redis(`/posts/self/${user_id}/${decode_cursor}`,JSON.stringify(redis_arr))
                }
                
                // 去 Redis 新增資料
                console.log("Redis設置完成，使用者",user_id,"的cursor為",cursor,"文章id為",postList.map(post => post.id))

                return res.status(200).json({
                    data: {
                        posts: postList,
                        next_cursor: (results.length - parseInt(decode_cursor) > 10) ? Buffer.from((decode_cursor+10).toString(), 'ascii').toString('base64') : null
                    }
                })

            }

        } catch (error) {
            return util.databaseError(error,'getSearch',res);
        }
    }
}
