const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Definir las rutas
router.post('/products', productController.createProduct);
router.get('/products', productController.getProducts);

module.exports = router;