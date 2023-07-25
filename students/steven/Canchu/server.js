const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Use Limiter
const limiter = rateLimit({
  windowMs: 1000,   // 1 second
  max: 10,          // 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Use CORS
app.use(cors());

// Use dotenv
require('dotenv').config();

// Use bodyparser
app.use(bodyParser.json());

// Use static
app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/.well-known/pki-validation/AD335B614CF30912AE7C22F2D222450F.txt', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'AD335B614CF30912AE7C22F2D222450F.txt');
  res.sendFile(filePath);
});

// Define all routes
const user_route = require('./routes/userRoutes');
app.use('/api/1.0/users', user_route);

const friend_route = require('./routes/friendRoutes');
app.use('/api/1.0/friends', friend_route);

const event_route = require('./routes/eventRoutes');
app.use('/api/1.0/events', event_route);

const post_route = require('./routes/postRoutes');
app.use('/api/1.0/posts', post_route);

app.get('/', (req, res) => {res.send('Main Page listening! -Dt22')})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;
