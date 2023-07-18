const express = require('express')
const app = express()
const router = express.Router();
const port = 80
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

app.use(cors());

require('dotenv').config();

app.use(bodyParser.json());

const user_route = require('./routes/userRoutes');
app.use('/api/1.0/users', user_route);

const friend_route = require('./routes/friendRoutes');
app.use('/api/1.0/friends', friend_route);

const event_route = require('./routes/eventRoutes');
app.use('/api/1.0/events', event_route);

const post_route = require('./routes/postRoutes');
app.use('/api/1.0/posts', post_route);

router.get('/', (req, res) => {res.send('Main Page listening! -Dt22')})

app.get('/.well-known/pki-validation/AD335B614CF30912AE7C22F2D222450F.txt', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'AD335B614CF30912AE7C22F2D222450F.txt');
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
