const purchaseService = require('../services/purchaseService');


//create purchases
exports.createPurchase = async (req, res) => {
    try {
        const { user_email, purchase_data, details } = req.body;

        // Validación básica
        if (!purchase_data || !details || details.length === 0) {
            return res.status(400).json({ error: 'Datos de compra inválidos' });
        }

        const result = await purchaseService.createPurchaseTransaction(purchase_data, details, user_email);

        res.status(201).json({ message: 'Compra registrada exitosamente', data: result });

    } catch (error) {
        console.error('Error en compra:', error);
        res.status(500).json({ error: error.message });
    }

};


//get purchases

exports.getPurchases = async (req, res) => {
    try {
        // Hacemos un JOIN simple para traer el nombre del proveedor y usuario
        const purchases = await db('purchases')
            .join('suppliers', 'purchases.supplier_id', 'suppliers.id')
            .join('users', 'purchases.user_id', 'users.id')
            .select(
                'purchases.*',
                'suppliers.name as supplier_name',
                'users.email as user_email'
            )
            .orderBy('purchases.created_at', 'desc');
            
        res.json(purchases);
    } catch (error) {
        console.error('Error listando compras:', error);
        res.status(500).json({ error: 'Error al obtener las compras' });
    }
};