const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const util = require('../utils/util')

router.get('/:group_id/member/pending', [util.authorize_bearer], groupController.getPending);

router.post('/:group_id/member/:user_id/agree', [util.authorize_bearer], groupController.agreeJoin );
router.post('/:group_id/join', [util.authorize_bearer], groupController.joinGroup );
router.post('/', [util.authorize_bearer,util.authorize_json], groupController.createGroup );

router.delete('/:id', [util.authorize_bearer], groupController.deleteGroup );

module.exports = router;