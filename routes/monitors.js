const express = require('express');
const router = express.Router();
const controller = require('../controllers/monitors');
const userController = require('../controllers/users');

router.route('/').get(controller.getMonitor);
router.route('/new').post(controller.addMonitor);
router.route('/update').put(controller.updateMonitor);
router.route('/delete').delete(controller.deleteMonitor);

module.exports = router;
