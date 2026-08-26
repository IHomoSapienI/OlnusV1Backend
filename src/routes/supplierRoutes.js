const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Rutas
router.post('/suppliers', supplierController.createSupplier);
router.get('/suppliers', supplierController.getAllSuppliers);
router.get('/suppliers/:id', supplierController.getSupplierById);

module.exports = router;