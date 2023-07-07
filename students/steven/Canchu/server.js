const express = require('express')
const app = express()
const port = 80
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Generate a JWT token
function generateToken(payload) {
  // Replace 'your_secret_key' with your own secret key for signing the token
  const token = jwt.sign(payload, 'dt22', { expiresIn: '1h' });
  return token;
}

const db = mysql.createConnection({
  host: 'localhost',
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

app.get('/', (req, res) => {
  res.send('Week 1 Assignment Part 1 is listening! -Dt22')
})

app.get('/api/1.0/users/signup', (req, res) => {
  res.send('This is the signup page for Week1 Assignment. -Dt22')
})

app.get('/api/1.0/users/signin', (req, res) => {
  res.send('This is the signin page for Week1 Assignment. -Dt22')
})

app.post('/api/1.0/users/signin', (req, res) => {
	const { provider, email, password, access_token } = req.body;
	if (provider !== 'native' && provider !== 'facebook') {
    		return res.status(403).json({ error: 'Invalid provider' });
  	}
	if (provider == 'native' && (!email || !password)) {
    		return res.status(400).json({ error: 'Email and password are required' });
  	}
	if (provider === 'facebook' && !access_token) {
    		return res.status(400).json({ error: 'Access token is required for Facebook login' });
  	}
	const sqlCheck = "SELECT ID, name, password FROM users WHERE email = ?"
	db.query(sqlCheck, [email], (errorCheck, resultsCheck) => {
                if (errorCheck) {
                        console.log('Database error:',errorCheck);
                        return res.status(500).json({ error: 'Database error' });
                }
		if(resultsCheck.length == 0){
			return res.status(403).json({ error: 'Email not exist' });
		} else {
			bcrypt.compare(password, resultsCheck[0].password).then(function (res) {
			const hashPwd = bcrypt.hashSync(resultsCheck[0].password, 10)
				if(!res){
					return res.status(403).json({ error: 'Incorrect Password' });
				}
  			});
		
			console.log('Log In Success! Info:',req.body,",Select total:",resultsCheck);
        		const user = {
                		id: resultsCheck[0].ID,
                		provider: provider,
                		name: resultsCheck[0].name,
                		email: email,
                		picture: "https://schoolvoyage.ga/images/123498.png"
        		}
        		return res.status(200).json({
                		data: {
                        		access_token: generateToken(user),
                        		user: user
                		}
        		})
		}
	})
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
				const sqlInsert = 'INSERT INTO users (Name, Email, Password) VALUES (?,?,?)'
				db.query(sqlInsert, [name,email,hashPwd], (errorInsert, resultsInsert) => {
					if(errorInsert){
						console.error('Database error:',errorInsert);
                        			return res.status(500).json({ error: 'Database error' });
					}
					const resultID = resultsInsert.insertId;
					const user = {
      						id: resultID,
      						provider: 'native',
      						name: name,
      						email: email,
      						picture: 'https://schoolvoyage.ga/images/123498.png'
    					};
    					// Send the success response
    					res.status(200).json({
      						data: {
        						access_token: generateToken(user),
        						user: user
      						}
    					});
					console.log('Email Success!',name,email,password,hashPwd)	
				})
			}catch(error){
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
