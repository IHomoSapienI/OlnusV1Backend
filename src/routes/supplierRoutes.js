const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Rutas
router.post('/suppliers', supplierController.createSupplier);
router.get('/suppliers', supplierController.getAllSuppliers);
router.get('/suppliers/:id', supplierController.getSupplierById);
router.post('/suppliers/link-supplies', supplierController.linkSupplierSupplies);
router.get('/suppliers/:supplierId/supplies', supplierController.getSuppliesBySupplier);
router.delete('/suppliers/:supplierId/supply/:supplyId', supplierController.deleteSupplierSupply);

module.exports = router;