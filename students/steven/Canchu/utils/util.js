const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

    authorize_json: (req, res, next) => {
        const token = req.headers.authorization;
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const accessToken = token.split(' ')[1];
        try {
            // Verify and decode the access token
            const decoded = jwt.verify(accessToken, 'dt22');
            req.user = decoded; // Attach the user information to the request object
            console.log("解碼成功！")
            next();
        } catch (error) {
            return res.status(403).json({ error: 'Invalid token' });
        }
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
    }
}