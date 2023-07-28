const util = require('../utils/util')
const { db } = require('../utils/util');

module.exports = {
    // id：TokenID,送訊息者｜user_id：接收訊息者
    sendMessage: async(res,id,user_id,message) => {
        try {
            const postTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const sql ='INSERT INTO message (context, send_id, receive_id, created_at) VALUES (?, ?, ?, ?)';
            const [postResults] = await db.query(sql, [message, id, user_id, postTime]);
            const insertId = postResults.insertId
            // Construct the response object
            const response = {
                data: {
                    message: {
                        id: insertId
                    }
                },
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'sendMessage',res);
        }
    },
    // id：我自己，Receiver；user_id：Sender
    search: async(res,id,user_id,cursor) => {
        try{
            const decode_cursor = cursor === undefined ? 0 : Number(Buffer.from(cursor, 'base64').toString('ascii'))
            // 條件：Receiver是我自己，要看到Sender的User資訊
            const sql =  `
            SELECT 
                m.id, m.context, m.created_at, u.id AS user_id, u.name, u.picture
            FROM 
                users AS u RIGHT JOIN message AS m ON u.id = m.receive_id
            WHERE 
                (m.send_id = ? AND m.receive_id = ?) OR (m.send_id = ? AND m.receive_id = ?)
            ORDER BY created_at DESC
            `
            var [temp] = await db.query(sql, [user_id,id,id,user_id])
            const results = temp[0] === undefined ? [] : temp.slice(decode_cursor, decode_cursor+10);
            const messageList = results.map((result) => {
                const { id, context, created_at, user_id, name, picture } = result;
                return {
                    id: id,
                    message: context,
                    created_at: util.time_converter(created_at),
                    user: {
                        id: user_id,
                        name: name,
                        picture: picture
                    }
                };
            })
            const response = {
                data: {
                    messages: messageList,
                    next_cursor: (temp.length - parseInt(decode_cursor) > 10) ? Buffer.from((decode_cursor+10).toString(), 'ascii').toString('base64') : null
                }
            }
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'search',res);
        }
    }
}
