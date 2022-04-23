const express = require('express');
const router = express.Router();
const controller = require('../controllers/monitors');

router.route('/').post(controller.addMonitor);
router.route('/:id')
.get(controller.getMonitor)
.put(controller.updateMonitor)
.delete(controller.deleteMonitor);

module.exports = router;
