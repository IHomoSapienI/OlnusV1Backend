// inventoryController.js
const inventoryService = require('../services/inventoryService');

// GET /api/inventory
exports.getAllStock = async (req, res) => {
    try {
        const result = await inventoryService.getAllStock();
        res.json(result);
    } catch (error) {
        console.error('Error getting inventory:', error);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
};

// GET /api/inventory/movements
exports.getAllMovements = async (req, res) => {
    try {
        const result = await inventoryService.getAllMovements();
        res.json(result);
    } catch (error) {
        console.error('Error getting movements:', error);
        res.status(500).json({ error: 'Error al obtener movimientos' });
    }
};

// GET /api/inventory/movements/:supplyId
exports.getMovementsByItem = async (req, res) => {
    try {
        const supplyId = req.params.supplyId;
        const result = await inventoryService.getMovementsByItem(supplyId);
        res.json(result);
    } catch (error) {
        console.error('Error getting movements by item:', error);
        res.status(500).json({ error: 'Error al obtener movimientos por insumo' });
    }
};

// POST /api/inventory/adjust
exports.adjustStock = async (req, res) => {
    try {
        const { supply_id, quantity, notes } = req.body;
        if (!supply_id || !quantity) {
            return res.status(400).json({ error: 'ID del insumo y cantidad obligatorios' });
        }

        const result = await inventoryService.adjustStock(supply_id, quantity, notes);
        res.status(201).json({ message: 'Ajuste realizado', data: result });
    } catch (error) {
        console.error('Error adjusting stock:', error);
        res.status(500).json({ error: error.message });
    }
};