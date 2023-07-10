const express = require('express')
const app = express()
const port = 80
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const axios = require('axios');
require('dotenv').config();

// Generate a JWT token
function generateToken(payload) {
	// Replace 'your_secret_key' with your own secret key for signing the token
	const token = jwt.sign(payload, process.env.JWT_SIGN, { expiresIn: '1h' });
	return token;
}

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
	console.log('Week 1 Assignment Part 1：Connected to MySQL database');
});

app.use(bodyParser.json());

const authorize = (req, res, next) => {
	const token = req.headers.authorization;
	if (!token || !token.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'No token provided' });
	}
	const accessToken = token.split(' ')[1];
	try {
		// Verify and decode the access token
		console.log("目前傳進來的Access Token:",accessToken)
		const decoded = jwt.verify(accessToken, 'dt22');
		req.user = decoded; // Attach the user information to the request object
		console.log("Token解碼後：",decoded)
		next();
	} catch (error) {
		return res.status(403).json({ error: 'Invalid token' });
	}
};

app.put('/api/1.0/users/profile', authorize, (req,res) => {
	const { name, introduction, tags } = req.body;
	const id = req.user.id;
	const sql = 'UPDATE users SET name = ? , introduction = ? , tags = ? WHERE id = ?'
	console.log("Check profile name intro tag update:",req.body)
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
})

app.put('/api/1.0/users/picture', authorize, (req,res) => {
	const { picture } = req.body;
	const id = req.user.id;
	console.log("現在要嘗試更新id=",id,"的資料")
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
})

app.get('/api/1.0/users/:id/profile', authorize, (req, res) => {
	const userId = req.params.id;
	// Retrieve user profile information from the database
	const sql = 'SELECT id, name, picture, friend_count, friendship, introduction, tags FROM users WHERE id = ?';
	// console.log("使用者：",req.user)
	db.query(sql, [userId], (error, results) => {
		if (error) {
			console.error('Database error:', error);
			return res.status(500).json({ error: 'Server error' });
		}
		if (results.length === 0) {
			return res.status(400).json({ error: 'User not found' });
		}
		const userProfile = results[0];
		// Construct the response object
		const response = {
			data: {
				user: {
					id: userId,
					name: userProfile.name,
					picture: userProfile.picture,
					friend_count: userProfile.friend_count,
					introduction: userProfile.introduction,
					tags: userProfile.tags,
					friendship: userProfile.friendship
				},
			},
		};
		console.log("Check profile update:",response)
		return res.status(200).json(response);
	});
});

app.get('/', (req, res) => {
	res.send('Week 1 Assignment Part 1 is listening! -Dt22')
})

app.get('/api/1.0/users/signup', (req, res) => {
	res.send('This is the signup page for Week1 Assignment. -Dt22')
})

app.get('/api/1.0/users/signin', (req, res) => {
	res.send('This is the signin page for Week1 Assignment. -Dt22')
})

app.post('/api/1.0/users/signin', async (req, res) => {
	const { provider, email, password, access_token } = req.body;
	console.log("登入帳密：",req.body)
	if(!provider){
		return res.status(400).json({ error: 'Provider is required' })
	}
	if (provider !== 'native' && provider !== 'facebook') {
		return res.status(403).json({ error: 'Invalid provider' });
  	}
	if (provider == 'native' && (!email || !password)) {
		return res.status(400).json({ error: 'Email and password are required' });
  	}
	if (provider === 'facebook' && !access_token) {
		return res.status(400).json({ error: 'Access token is required for Facebook login' });
  	}
	if (provider === 'facebook') {
		await axios
			.get(`https://graph.facebook.com/v17.0/me?fields=id,name,email&access_token=${access_token}`)
			.then((response) => { 
				const {id, name, email} = response.data;
				// console.log("Facebook success!Data is:",response.data)
				const user = {
					id,
					provider,
					name,
					email,
					picture: `https://graph.facebook.com/${id}/picture?type=large`,
				};
				const token = generateToken(user);
				res.status(200).json({
					data: {
						access_token: token,
						user: user,
					},
				});
			})
	} else {
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
				bcrypt.compare(password, userInfo.Password).then(function (pwdResult) {
					console.log("tmp:",pwdResult)
					if(!pwdResult){
							return res.status(403).json({ error: 'Incorrect Password' });
					} else {
						// console.log("登入UserInfo：",userInfo)
						const user = {
							id: userInfo.ID,
							provider: provider,
							name: userInfo.Name,
							email: userInfo.Email,
							picture: userInfo.picture,
							introduction: userInfo.introduction,
							tags: userInfo.tags,
							friend_count: userInfo.friend_count,
							friendship: userInfo.friendship
						}
						console.log("登入後的User結果：",user)
						return res.status(200).json({
							data: {
								access_token: generateToken(user),
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
	}
})

app.post('/api/1.0/users/signup', async (req, res) => {
    // Extract data from request body
    console.error(req.body);
    const { name, email, password } = req.body;
    // Perform validation
    if (!name || !email || !password) {    
		return res.status(400).json({ error: 'Missing required fields' });
    } else {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (emailRegex.test(email)) {
				console.log(emailRegex.test(email))
			} else {
				// Email format is incorrect
				console.error('Email incorrect format error')
				return res.status(400).json({ error: 'Email format is incorrect' });
			}
		const sqlCheck = 'SELECT COUNT(*) as count FROM users WHERE Email = ?'
		db.query(sqlCheck, [email], (errorCheck, resultsCheck) => {
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
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (emailRegex.test(email)) {			
				} else {
					// Email format is incorrect
					return res.status(400).json({ error: 'Email format is incorrect' });
				}
				try{
					const hashPwd = bcrypt.hashSync(password, 10);
					const sqlInsert = 'INSERT INTO users (Name, Email, Password, friend_count, introduction, tags, friendship, picture) VALUES (?,?,?,?,?,?,?,?)'
					db.query(sqlInsert, [name,email,hashPwd,0,'','',null,''], (errorInsert, resultsInsert) => {
							if(errorInsert){
								console.error('Database error:',errorInsert);
								return res.status(500).json({ error: 'Database error' });
							}
							console.log("註冊結果：",resultsInsert)
							const resultID = resultsInsert.insertId;
							const user = {
								id: resultID,
								provider: 'native',
								name: name,
								email: email,
								picture: '',
								introduction: '',
								tags: '',
								friend_count: 0,
								friendship: null
							};
							// Send the success response
							res.status(200).json({
								data: {
									access_token: generateToken(user),
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
	}
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
