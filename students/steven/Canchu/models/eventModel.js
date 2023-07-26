const util = require('../utils/util')
const { db } = require('../utils/util');

module.exports = {
    getEvent: async(res,userId) => {
        try {
            const sql = 'SELECT id, type, image, summary, is_read, created_at FROM event WHERE user_id = ? ORDER BY created_at DESC'
            const [results] = await db.query(sql, [userId])
            const userEvent = results.map((result) => {
                const {id, type, is_read, image, created_at, summary} = result
                return {
                    id: id,
                    type: type,
                    is_read: is_read == 0 ? false : true,
                    image: image,
                    created_at: created_at,
                    summary: summary
                };
            })
            // Construct the response object
            const response = {
                data: {
                    events: userEvent
                },
            };
            return res.status(200).json(response);
        } catch (error) {
            return util.databaseError(error,'getEvent',res);
        }
    },
    readEvent: async(res,userId,eventId) => {
        try {
            const sql_validate = 'SELECT user_id FROM event WHERE id = ?';
            const [results] = await db.query(sql_validate,[eventId])
            if (results[0].user_id !== userId){
                return res.status(400).json({ error: 'This user has no permission to read event'})
            } else {
                const sql = 'UPDATE event SET is_read = true WHERE id = ?';
                await db.query(sql, [eventId])
                const response = {
                    data: {
                        events: {
                            id: eventId
                        },
                    },
                };
                return res.status(200).json(response);
            }
        } catch (error) {
            return util.databaseError(error,'getEvent',res);
        }
    }
}
