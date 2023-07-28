const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const util = require('../utils/util')

router.get('/:user_id/message(s)?', [util.authorize_bearer], chatController.search);

router.post('/:user_id', [util.authorize_bearer,util.authorize_json], chatController.sendMessage);

module.exports = router;