const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const redis = require('./utils/redis')

// Use CORS
app.use(cors());

// Use Rate Limiter
app.use(redis.rateLimiter)

// Use dotenv
require('dotenv').config();

// Use bodyparser
app.use(bodyParser.json());

// Use static
app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/.well-known/pki-validation/pki-validation/78A58ABC0325C433B8226825EECA3AB3.txt', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'pki-validation/78A58ABC0325C433B8226825EECA3AB3.txt');
  res.sendFile(filePath);
});

// Define all routes
const user_route = require('./routes/userRoutes');
app.use('/api/1.0/users',user_route);

const friend_route = require('./routes/friendRoutes');
app.use('/api/1.0/friends',friend_route);

const event_route = require('./routes/eventRoutes');
app.use('/api/1.0/events',event_route);

const post_route = require('./routes/postRoutes');
app.use('/api/1.0/posts',post_route);

const group_route = require('./routes/groupRoutes');
app.use('/api/1.0/groups',group_route);

const chat_route = require('./routes/chatRoutes');
app.use('/api/1.0/chat',chat_route);

app.get('/',(req, res) => {res.send('Main Page listening! -Dt22')})

module.exports = app;
