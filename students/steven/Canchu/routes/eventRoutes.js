const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const util = require('../utils/util')

router.get('/', [util.authorize_bearer], eventController.getEvent);

router.post('/:event_id/read', [util.authorize_bearer], eventController.readEvent);

module.exports = router;