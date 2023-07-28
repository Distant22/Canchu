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
    deleteGroup: async(res,id) => {
        try {
            console.log("刪除社團：社團ID為",id)
            const validate_sql = 'SELECT * FROM group_data WHERE id = ?'
            const [validate_result] = await db.query(validate_sql, [id])
            console.log("刪除驗證：",validate_result)
            if(validate_result.length === 0){ 
                return res.status(400).json({ error: `There's no such group.` });
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
            console.log("加入社團：社團ID為",group_id,"使用者ID為",id)
            const validate_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
            const [validate_result] = await db.query(validate_sql, [group_id])
            if(validate_result[0].user_id === id){ 
                return res.status(400).json({ error: `You can't join your own group.` });
            } else {
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
            return util.databaseError(error,'joinGroup',res);
        }
    },
    // id：Token持有者；group_id：他想看的社團ID
    getPending: async(res,id,group_id) => {
        try {
            const validate_sql = 'SELECT creator_id FROM group_data WHERE id = ?'
            const [validate_result] = await db.query(validate_sql, [group_id])
            if(validate_result[0].user_id !== id){ 
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
    }
}
