const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');

router.route('/new').post(controller.addUser);
router.route('/update').put(controller.updateUser);
router.route('/delete').delete(controller.deleteUser);
router.route('/signin').post(controller.signIn);
router.route('/signout').post(controller.signOut);

module.exports = router;
