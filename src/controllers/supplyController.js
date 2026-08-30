const supplyService = require('../services/supplyService');

// --- INSUMOS ---
exports.createSupply = async (req, res) => {
    try {
        const { name, supply_category_id, unit_id, minimum_stock } = req.body;
        const result = await supplyService.createSupply(name, supply_category_id, unit_id, minimum_stock);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error en insumo:', error.message);
        res.status(400).json({ error: error.message });
    }
};

exports.getSupplies = async (req, res) => {
    try {
        const supplies = await supplyService.listSupplies();
        res.json(supplies);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener insumos' });
    }
};