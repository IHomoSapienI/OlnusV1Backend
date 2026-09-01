const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

router.post('/purchases', purchaseController.createPurchase);
router.get('/purchases', purchaseController.getAllPurchases);
router.get('/purchases/:id', purchaseController.getPurchaseDetails);

module.exports = router;