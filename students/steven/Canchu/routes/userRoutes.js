const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const util = require('../utils/util')

router.post('/signin', userController.signin);
router.post('/signup', userController.signup);

router.get('/signup', (req, res) => {res.send('This is the signup page for Week1 Assignment. -Dt22')})
router.get('/signin', (req, res) => {res.send('This is the signin page for Week1 Assignment. -Dt22')})
router.get('/:id/profile', util.authorize_bearer, userController.getProfile);

router.put('/profile', util.authorize_bearer, userController.updateProfile);
router.put('/picture', util.authorize_bearer, userController.updatePicture);

module.exports = router;