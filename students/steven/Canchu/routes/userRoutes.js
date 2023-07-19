const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const util = require('../utils/util')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'static');
        // Check if the upload directory exists, and create it if it doesn't
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
	cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
var upload = multer({storage: storage})

router.post('/signin', [util.authorize_json], userController.signin);
router.post('/signup', [util.authorize_json], userController.signup);

router.get('/signup', (req, res) => {res.send('This is the signup page for Week1 Assignment. -Dt22')})
router.get('/signin', (req, res) => {res.send('This is the signin page for Week1 Assignment. -Dt22')})
router.get('/:id/profile', [util.authorize_bearer], userController.getProfile);
router.get('/search', [util.authorize_bearer], userController.search);

router.put('/profile', [util.authorize_bearer,util.authorize_json], userController.updateProfile);
router.put('/picture', [util.authorize_bearer,util.authorize_multipart], upload.single('picture'), userController.updatePicture);

module.exports = router;
