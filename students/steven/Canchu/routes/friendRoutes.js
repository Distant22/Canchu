const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const util = require('../utils/util')

router.post('/:user_id/request', util.authorize_json, friendController.postRequest);
router.get('/pending', util.authorize_json, friendController.getPending);

module.exports = router;