const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');

router.route('/').post(controller.addUser)
    .put(controller.updateUser)
    .delete(controller.deleteUser);
router.route('/signin').post(controller.signIn);
router.route('/signout').post(controller.signOut);

module.exports = router;
