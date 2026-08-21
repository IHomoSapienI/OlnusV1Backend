const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Ruta para registrar una compra (Transacción completa)
// Espera un JSON con: user_email, purchase_data, details
router.post('/purchases', purchaseController.createPurchase);

// Ruta para listar compras (opcional, para pruebas)
router.get('/purchases', purchaseController.getPurchases);

module.exports = router;