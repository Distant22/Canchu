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
            console.log("postGroup：社團ID為",group_id,"內文為",context,"Token ID為",id)
            const search_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
            const [validate_result] = await db.query(search_sql, [group_id])
            console.log("agreeJoin - 有無社團驗證：",validate_result)
            if(validate_result.length === 0){ 
                return res.status(400).json({ error: `There's no such group.` });
            } else if(validate_result[0].creator_id !== id){ 
                return res.status(400).json({ error: `You have no permission to post this.` });
            }
            const postTime = new Date().toISOString().slice(0, 19).toLocaleString('en-US', { timeZone: 8 });
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
    }
}
