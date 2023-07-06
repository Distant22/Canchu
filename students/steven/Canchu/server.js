const express = require('express')
const app = express()
const port = 80
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
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

app.post('/api/1.0/users/signup', (req, res) => {
    // Extract data from request body
    console.error(req.body);
    const { name, email, password } = req.body;
  
    // Perform validation
    if (!name || !email || !password) {
    
      console.error(!name,!email,!password)
      return res.status(400).json({ error: 'Missing required fields' });
    
    } else {

	const sqlCheck = 'SELECT COUNT(*) as count FROM users WHERE Email = ?'
	db.query(sqlCheck, [email], (errorCheck, resultsCheck) => {
		if (errorCheck) {
			console.log('Database error:',errorCheck);
        		return res.status(500).json({ error: 'Database error' });
      		}
		const userCount = resultsCheck[0].count
      		if (userCount > 0) {
        		// A user with the same email already exists
			console.log('Email Fail!',name,email,password)
        		return res.status(400).json({ error: 'Email already exists' });
      		} else {
			const sqlInsert = 'INSERT INTO users (Name, Email, Password) VALUES (?,?,?)'
			db.query(sqlInsert, [name,email,password], (errorInsert, resultsInsert) => {
				if(errorInsert){
					console.log('Database error:',errorCheck);
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
				console.log('Email Success!',name,email,password)	
			})	
		}
	})
    }
  
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
