const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const util = require('../utils/util')

router.post('/:user_id/request', [util.authorize_bearer], friendController.postRequest);
router.post('/:friendship_id/agree', [util.authorize_bearer], friendController.postAgree);

router.get('/', [util.authorize_bearer], friendController.getFriends);
router.get('/pending', [util.authorize_bearer], friendController.getPending);

router.delete('/:friendship_id', [util.authorize_bearer], friendController.deleteFriend);

module.exports = router;