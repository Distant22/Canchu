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
	console.log('User Model：Connected to MySQL database');
});

module.exports = {
    // 取得User ID, User name, User picture, Friendship 的主鍵id, Friendship 的status
    search: async(res,keyword) => {
        const sql = 'SELECT users.id, users.name, users.picture, friendship.id, friendship.status FROM users INNER JOIN friendship ON users.id = friendship.user_id WHERE users.name LIKE '+"'%"+"?"+"%'"
        db.query(sql,[keyword], (error, results) => {
            if (error) {
                console.log('Database error:',error);
                return res.status(500).json({ error: 'Database error' });
            }
            const searchList = results.map((result) => {
                const {id, name, picture, friend_id, status} = result
                console.log("結果：",result)
                return {
                    id: id,
                    name: name,
                    picture: picture,
                    friendship: {
                        id: friend_id,
                        status: status
                    }
                };
            })
            return res.status(200).json({
                data: {
                    users: searchList
                }
            })
        })
    },

    signin: async(res,email,password,provider) => {
        const sqlCheck = "SELECT * FROM users WHERE email = ?"
        db.query(sqlCheck, [email], (errorCheck, resultsCheck) => {
            if (errorCheck) {
                console.log('Database error:',errorCheck);
                return res.status(500).json({ error: 'Database error' });
            }
            if(resultsCheck.length == 0){
                return res.status(403).json({ error: 'Email not exist' });
            } else {
                const userInfo = resultsCheck[0]
                bcrypt.compare(password, userInfo.password).then(function (pwdResult) {
                    if(!pwdResult){
                        return res.status(403).json({ error: 'Incorrect Password' });
                    } else {
                        // 全部包起來做成Token
                        const user = {
                            id: userInfo.id,
                            provider: provider,
                            name: userInfo.name,
                            email: userInfo.email,
                            picture: userInfo.picture,
                            introduction: userInfo.introduction,
                            tags: userInfo.tags,
                            friend_count: userInfo.friend_count
                        }
                        console.log("Signin success, user info=",user)
                        return res.status(200).json({
                            data: {
                                access_token: util.generateToken(user),
                                user: {
                                    id: user.id,
                                    provider: user.provider,
                                    name: user.name,
                                    email: user.email,
                                    picture: user.picture
                                }
                            }
                        })
                    }
                });
            }
        })
    },

    signup: async (res,name,email,password) => {
        const sqlCheck = 'SELECT COUNT(*) as count FROM users WHERE Email = ?'
        db.query(sqlCheck, [email], async (errorCheck, resultsCheck) => {
            if (errorCheck) {
                console.error('Database error:',errorCheck);
                return res.status(500).json({ error: 'Database error' });
            }
            const userCount = resultsCheck[0].count
            if (userCount > 0) {
                // A user with the same email already exists
                console.error('Email Fail!',name,email,password)
                return res.status(403).json({ error: 'Email already exists' });
            } else {
                try{
                    const hashPwd = bcrypt.hashSync(password, 10);
                    const sqlInsert = 'INSERT INTO users (Name, Email, Password, friend_count, introduction, tags, picture) VALUES (?,?,?,?,?,?,?)'
                    db.query(sqlInsert, [name,email,hashPwd,0,'','',''], (errorInsert, resultsInsert) => {
                        if(errorInsert){
                            console.error('Database error:',errorInsert);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        const resultID = resultsInsert.insertId;
                        // 全部包起來做成Token
                        const user = {
                            id: resultID, 
                            provider: 'native', 
                            name: name, 
                            email: email, 
                            picture: '', 
                            introduction: '', 
                            tags: '', 
                            friend_count: 0
                        };
                        console.log("User signup success, info=",user)
                        res.status(200).json({
                            data: {
                                access_token: util.generateToken(user),
                                user: {
                                    id: user.id,
                                    provider: user.provider,
                                    name: user.name,
                                    email: user.email,
                                    picture: user.picture,
                                }
                            }
                        });
                    })
                } catch(error) {
                    console.error('Hashing error:',error)
                    res.status(500).json({ error: 'Hashing password error' });
                }
            }
        })
    },

    getProfile: async(res,userId) => {
        const sql = 'SELECT id, name, picture, friend_count, introduction, tags FROM users WHERE id = ?';
        console.log("Get profile, ID=",userId)
        db.query(sql, [userId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            if (results.length === 0) {
                return res.status(400).json({ error: 'User not found' });
            }
            const userProfile = results[0];
            console.log("User Profile Selected, results=",userProfile)
            // Construct the response object
            const friendsql =  'SELECT friend_id, status FROM friendship WHERE user_id = ?'
            db.query(friendsql, [userId], (error,results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ error: 'Server error' });
                }
                const friendshipData = results.length === 0 ? null : results.map(friendship => ({
                    id: friendship.friend_id,
                    status: friendship.status
                }));
                const response = {
                    data: {
                        user: {
                            id: userProfile.id,
                            name: userProfile.name,
                            picture: userProfile.picture,
                            friend_count: userProfile.friend_count,
                            introduction: userProfile.introduction,
                            tags: userProfile.tags,
                            friendship: friendshipData === null ? friendshipData : friendshipData[0]
                        },
                    },
                };
                console.log("User Profile get success, response=",response)
                return res.status(200).json(response);
            })
        });
    },

    updateProfile: async (res,name,introduction,tags,id) => {
        const sql = 'UPDATE users SET name = ? , introduction = ? , tags = ? WHERE id = ?'
        db.query(sql, [name, introduction, tags, id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            if (results.length === 0) {
                return res.status(400).json({ error: 'User not found' });
            }
            // Construct the response object
            const response = {
                data: {
                    user: {
                        id: id,
                    },
                },
            };
            return res.status(200).json(response);
        });
    },

    updatePicture: async (res, picture, id) => {
        const sql = 'UPDATE users SET picture = ? WHERE id = ?'
        db.query(sql, [picture, id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Server error' });
            }
            if (results.length === 0) {
                return res.status(400).json({ error: 'User not found' });
            }
            // Construct the response object
            const response = {
                data: {
                    picture: picture
                },
            };
            return res.status(200).json(response);
        });
    }
}
