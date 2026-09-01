const purchaseService = require('../services/purchaseService');

// POST /api/purchases
exports.createPurchase = async (req, res) => {
    try {
        const { user_email, purchase_data, details } = req.body;

        // Validación
        if (!user_email || !purchase_data || !details || details.length === 0) {
            return res.status(400).json({ error: 'Datos de compra inválidos' });
        }

        const result = await purchaseService.createPurchase(purchase_data, details, user_email);

        res.status(201).json({ message: 'Compra registrada exitosamente', data: result });
    } catch (error) {
        console.error('Error en compra:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/purchases
exports.getAllPurchases = async (req, res) => {
    try {
        const result = await purchaseService.getAllPurchases();
        res.json(result);
    } catch (error) {
        console.error('Error listing purchases:', error);
        res.status(500).json({ error: 'Error al obtener las compras' });
    }
};

// GET /api/purchases/:id
exports.getPurchaseDetails = async (req, res) => {
    try {
        const result = await purchaseService.getPurchaseDetails(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error getting purchase details:', error);
        res.status(500).json({ error: 'Error al obtener detalles de la compra' });
    }
};