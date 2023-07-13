const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const util = require('../utils/util')

router.post('/', [util.authorize_bearer,util.authorize_json], postController.createPost);
router.post('/:id/like', [util.authorize_bearer], postController.createLike);
router.post('/:id/comment', [util.authorize_bearer], postController.createComment);

router.put('/:id', [util.authorize_bearer], postController.updatePost);

router.get('/:id', [util.authorize_bearer], postController.getDetail)

router.delete('/:id/like', [util.authorize_bearer], postController.deleteLike);

module.exports = router;