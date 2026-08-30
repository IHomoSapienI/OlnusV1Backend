const express = require('express');
const router = express.Router();
const supplyController = require('../controllers/supplyController');


// Insumos
router.post('/supplies', supplyController.createSupply);
router.get('/supplies', supplyController.getSupplies);

module.exports = router;