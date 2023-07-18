const jwt = require('jsonwebtoken');

module.exports = {

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
            return res.status(415).json({ error: 'Invalid content type' })
        } else { next(); }
    },

    authorize_multipart: (req,res,next) => {
        const type = req.get('content-type')
        if (type !== 'multipart/form-data'){
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
    }
}