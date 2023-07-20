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
    getEvent: async(res,userId) => {
        const sql = 'SELECT id, type, image, summary, is_read, created_at FROM event WHERE user_id = ? ORDER BY created_at DESC';
        console.log("進入getEvent")
        db.query(sql, [userId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
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
        })
    },
    readEvent: async(res,userId,eventId) => {
	console.log("進入readEvent","userId=",userId,"eventId=",eventId)
        const sql_validate = 'SELECT user_id FROM event WHERE id = ?';
        db.query(sql_validate,[eventId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
	    console.log("結果：",results,results[0])
            if (results[0].user_id !== userId){
                console.error('錯誤！此欄的userId和Token的實際id分別為',results[0].user_id,userId)
                return res.status(400).json({ error: 'This user has no permission to read event'})
            } else {
                console.log('回傳-',results[0])
                const sql = 'UPDATE event SET is_read = true WHERE id = ?';
                db.query(sql, [eventId], (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return res.status(500).json({ error: 'Server error' });
                    }
                    // Construct the response object
                    const response = {
                        data: {
                            events: {
                                id: eventId
                            },
                        },
                    };
                    return res.status(200).json(response);
                })
            }
        })
    }
}
