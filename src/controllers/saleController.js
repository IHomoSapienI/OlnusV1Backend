const saleService = require('../services/saleService');

exports.createSale = async (req, res) => {
    try {
        const { user_email, sale_data, items } = req.body;

        // Validación básica
        if (!sale_data || !items || items.length === 0) {
            return res.status(400).json({ error: 'Datos de la venta inválidos' });
        }

        const result = await saleService.createSaleTransaction(sale_data, items, user_email);

        res.status(201).json({ 
            message: 'Venta registrada exitosamente', 
            sale_id: result.id, 
            total: result.total 
        });

    } catch (error) {
        console.error('Error en venta:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// (Opcional) Listar ventas para pruebas
exports.getSales = async (req, res) => {
    try {
        console.log("⏳ Intentando conectar a Supabase...");
        const db = require('../database/knex');
        const sales = await db('sales')
            .join('users', 'sales.user_id', 'users.id')
            .select('sales.*', 'users.email')
            .orderBy('sales.created_at', 'desc');
        res.json(sales);
    } catch (error) {
        console.error('Error listando ventas:', error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
};