const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

//const db = mysql.createPool({
//    host: process.env.DB_HOST || 'localhost',
//    user: process.env.DB_USERNAME,
//    password: process.env.DB_PASSWORD,
//    database: process.env.NODE_ENV === "test" ? 'test' : 'user'
//});

const db = mysql.createPool({
    host: "database-1.c7sxgxjjczof.ap-southeast-2.rds.amazonaws.com",
    user: "Dt22",
    password: "22pilots71416",
    database: "user"
})

module.exports = {

    // 2023-07-28 06:44:23
    time_converter: (time) => {
        time = time.toString()
        const charArray = time.split('');
        console.log("Array:",charArray)
        const hour = charArray[11] + charArray[12]
        const newHour = (parseInt(hour, 10) + 8 >= 24) ? parseInt(hour, 10) + 8 - 24 : parseInt(hour, 10) + 8
        const hourArray = (newHour.toString()).split('');
        charArray[11] = hourArray[0]
        charArray[12] = hourArray[1]
        return charArray.join('');
    },
    db: db,
    closeConnection: () => {
        db.end((err) => {
          if (err) {
            console.error('Error closing the database connection:', err.message);
          } else {
            console.log('Database connection closed.');
          }
        });
    },

    authorize_bearer: (req, res, next) => {
        const token = req.headers.authorization;
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const accessToken = token.split(' ')[1];
        try {
            // Verify and decode the access token
            const decoded = jwt.verify(accessToken, process.env.JWT_SIGN);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({ error: 'Invalid token' });
        }
    },

    authorize_json: (req,res,next) => {
        const type = req.get('content-type')
        if (type !== 'application/json'){
            console.error("Header型態不符，目前為：",type)
            return res.status(415).json({ error: 'Invalid content type' })
        } else { next(); }
    },

    authorize_multipart: (req,res,next) => {
        const type = req.get('content-type')
	console.log("截斷的內容型態：",type.substring(0, 19))    
        if (type.substring(0, 19) !== 'multipart/form-data'){
            console.log("現在的type為",type)
            return res.status(415).json({ error: 'Invalid content type' })
        } else { next(); }
    },

    generateToken: (payload) => {
        // Replace 'your_secret_key' with your own secret key for signing the token
        const token = jwt.sign(payload, process.env.JWT_SIGN, { expiresIn: '1h' });
        return token;
    },

    emailValidate: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            return true
        } else {
            return false
        }
    },

    databaseError: (error,fn,res) => {
        console.error('Error happened at function -',fn)
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Server error' });
    },

    generateRandomString(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let result = 'u-';
      
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          result += characters.charAt(randomIndex);
        }
      
        return result;
    }
}
