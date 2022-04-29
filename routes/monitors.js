const express = require('express');
const router = express.Router();
const controller = require('../controllers/monitors');

router.route('/getReport').get(controller.getReport);
router.route('/:id')
    .get(controller.getMonitor)
    .put(controller.updateMonitor)
    .delete(controller.deleteMonitor);
router.route('/').post(controller.addMonitor);

module.exports = router;
