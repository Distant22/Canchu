const util = require('../utils/util')
const { db } = require('../utils/util');

module.exports = {
    createGroup: async(res,id,name) => {
        try {
            console.log("創建社團：使用者ID為",id,"名稱為",name)
            const sql = 'INSERT INTO group_data (creator_id,name) VALUES (?,?)'
            const [results] = await db.query(sql, [id,name])
            const resultID = results.insertId;
            // Construct the response object
            const response = {
                data: {
                    group:{
                        id: resultID
                    }
                },
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'createGroup',res);
        }
    },
    deleteGroup: async(res,user_id,id) => {
        try {
            console.log("刪除社團：社團ID為",id)

            const search_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
            const [validate_result] = await db.query(search_sql, [id])
            console.log("刪除驗證：",validate_result)
            if(validate_result.length === 0){ 
                return res.status(400).json({ error: `There's no such group.` });
            } else if(validate_result[0].creator_id !== user_id){ 
                return res.status(400).json({ error: `You have no permission to delete this.` });
            } else {

                const sql = 'DELETE FROM group_data WHERE id = ?'
                await db.query(sql, [id])
                // Construct the response object
                const response = {
                    data: {
                        group:{
                            id: id
                        }
                    },
                };
                return res.status(200).json(response);
            }
        } catch (error) {
            return util.databaseError(error,'deleteGroup',res);
        }
    },
    // id：Token持有者；group_id：他想加的社團ID
    joinGroup: async(res,id,group_id) => {
        try {

            const search_sql = 'SELECT * FROM group_data WHERE id = ?'
            const [search_result] = await db.query(search_sql, [group_id])
            console.log("取得joinGroup驗證：",search_result)
            if(search_result.length === 0){ 
                return res.status(400).json({ error: `There's no such group.` });
            } else {

                console.log("加入社團：社團ID為",group_id,"使用者ID為",id)
                const validate_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
                const [validate_result] = await db.query(validate_sql, [group_id])
                if(validate_result[0].creator_id === id){ 
                    return res.status(400).json({ error: `You can't join your own group.` });
                } 

                const sql = 'INSERT INTO groupMember (group_id,user_id) VALUES (?,?)'
                await db.query(sql, [group_id,id])
                // Construct the response object
                const response = {
                    data: {
                        group:{
                            id: group_id
                        }
                    },
                };
                return res.status(200).json(response);
            }
        } catch (error) {
            if(error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: `Duplicate Request.` })
            }
            return util.databaseError(error,'joinGroup',res);
        }
    },
    // id：Token持有者；group_id：他想看的社團ID
    getPending: async(res,id,group_id) => {
        try {
            
            const search_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
            const [validate_result] = await db.query(search_sql, [group_id])
            console.log("取得Pending驗證：",validate_result)
            if(validate_result.length === 0){ 
                return res.status(400).json({ error: `There's no such group.` });
            } else if(validate_result[0].creator_id !== id){ 
                return res.status(400).json({ error: `You have no permission to see this.` });
            } else {

                const sql = `SELECT u.id, u.name, u.picture, g.status FROM users AS u LEFT JOIN groupMember AS g ON u.id = g.user_id WHERE g.status = 'pending' AND g.group_id = ?`
                const [results_list] = await db.query(sql, [group_id])
                const userList = results_list.map((result) => {
                    const { id, name, picture, status } = result
                    return {
                        id: id,
                        name: name,
                        picture: picture,
                        status: status
                    };
                })
                console.log("Pending的UserList：",userList)
                // Construct the response object
                const response = {
                    data: {
                        users: userList
                    },
                };
                return res.status(200).json(response);
            }
        } catch (error) {
            return util.databaseError(error,'joinGroup',res);
        }
    },
    // id：Token持有者，要答應讓這個人入社
    // user_id：想要入社的人的ID
    // 1.確認有無此社團 2.確認我是否有權限 3.確認有無此人 4.確認此人是否在社團 5.確認此人是否已入社
    agreeJoin: async(res,id,user_id,group_id) => {
        try {
            console.log("agreeJoin：社團ID為",group_id,"使用者為",user_id,"Token ID為",id)
            // 1.確認有無此社團 2.確認我是否有權限
            const search_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
            const [validate_result] = await db.query(search_sql, [group_id])
            console.log("agreeJoin - 有無社團驗證：",validate_result)
            if(validate_result.length === 0){ 
                return res.status(400).json({ error: `There's no such group.` });
            } else if(validate_result[0].creator_id !== id){ 
                return res.status(400).json({ error: `You have no permission to agree this.` });
            }

            // 3.確認有無此人 4.確認此人是否在社團 5.確認此人是否已入社
            const sql = 'SELECT status FROM groupMember WHERE group_id = ? AND user_id = ?'
            const [result] = await db.query(sql, [group_id,user_id])
            if(result.length === 0) {
                return res.status(400).json({ error: `This user has not request to join the group.` });
            } else if(result[0].status !== 'pending'){ 
                return res.status(400).json({ error: `This user is already joined.` });
            } else {
                const update_sql = 'UPDATE groupMember SET status = ? WHERE group_id = ? AND user_id = ?'
                await db.query(update_sql, ['agreed',group_id,user_id])

                const response = {
                    data: {
                        user: {
                            id: user_id
                        }
                    },
                };
                return res.status(200).json(response);
            }

        } catch (error) {
            return util.databaseError(error,'agreeJoin',res);
        }
    },
    postGroup: async(res,id,group_id,context) => {
        try {

            const search_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
            const [search_result] = await db.query(search_sql, [group_id])
            if(search_result.length === 0){ 
                return res.status(400).json({ error: `There's no such group.` });
            } else if (search_result[0].creator_id !== id) {
                const validate_sql = `SELECT * FROM groupMember WHERE group_id = ? AND user_id = ? AND status = 'agreed'`
                const [validate_result] = await db.query(validate_sql, [group_id,id])
                if(validate_result.length === 0){ 
                    return res.status(400).json({ error: `You have no permission to post this.` });
                }
            }
            
            const postTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const update_sql = `
            INSERT INTO groupPost (group_id, user_id, created_at, context, picture, name)
            WITH my_info AS (
                SELECT picture, name FROM users WHERE id = ?
            )
            SELECT ?, ?, ?, ?, picture, name
            FROM my_info;
            `
            const [results] = await db.query(update_sql, [id,group_id,id,postTime,context])
            const resultID = results.insertId;
            const response = {
                data: {
                    group: {
                        id: group_id
                    },
                    user: {
                        id: id
                    },
                    post: {
                        id: resultID
                    }
                },
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'postGroup',res);
        }
    },
    search: async(res,id,group_id) => {
        try {

            console.log("確認Search：Token ID為",id,"Group ID為",group_id);

            const search_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
            const [search_result] = await db.query(search_sql, [group_id])
            if(search_result.length === 0){ 
                return res.status(400).json({ error: `There's no such group.` });
            } else if (search_result[0].creator_id !== id){
                const validate_sql = `SELECT * FROM groupMember WHERE group_id = ? AND user_id = ? AND status = 'agreed'`
                const [validate_result] = await db.query(validate_sql, [group_id,id])
                if(validate_result.length === 0){ 
                    return res.status(400).json({ error: `You have no permission to post this.` });
                }
            }

            const sql = `
            SELECT p.id, p.user_id, p.created_at, p.context, p.like_count, p.comment_count, u.picture, u.name, 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM group_postlike AS pl WHERE pl.user_id = ? AND pl.post_id = p.id
                    ) THEN 1
                    ELSE 0
                END AS is_liked 
            FROM groupPost AS p LEFT JOIN users AS u ON p.user_id = u.id 
            WHERE p.group_id = ? 
            `
            const [results] = await db.query(sql, [id,group_id])
            const postList = results.map((result) => {
                const { id, user_id, created_at, context, like_count, comment_count, picture, name, is_liked } = result;
                // Format the date as "YYYY-MM-DD HH:mm:ss"
                const formatted_created_at = new Date(created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Taipei',
                });
                return {
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
            })
            const response = {
                data: {
                    posts: postList
                }
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'search',res);
        }
    }
}
