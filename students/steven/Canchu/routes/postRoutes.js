const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const util = require('../utils/util')

router.post('/', [util.authorize_bearer,util.authorize_json], postController.createPost);

router.put('/:id', [util.authorize_bearer], postController.updatePost);

module.exports = router;