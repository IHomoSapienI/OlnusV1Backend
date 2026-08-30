const supplyRepo = require('../repositories/supplyRepository');
const db = require('../database/knex');
const { randomUUID } = require('crypto'); // <-- Importa crypto

// --- SOLO INSUMOS (NO categorías) ---
exports.createSupply = async (name, supply_category_id, unit_id, minimum_stock) => {
    if (!name || !supply_category_id || !unit_id) {
        throw new Error('Nombre, categoría y unidad de medida son obligatorios');
    }

    try {
        // 1. Insertar el insumo
        const supply = await supplyRepo.insertSupply({
            name,
            supply_category_id,
            unit_id,
            minimum_stock: minimum_stock || 0
        });

        // 2. Inicializar stock en 0 (con crypto.randomUUID)
        await db('current_stock')
            .insert({
                id: randomUUID(), // <-- Usa crypto
                item_type: 'supply',
                item_id: supply.id,
                current_quantity: 0,
                updated_at: db.fn.now()
            })
            .onConflict(['item_type', 'item_id'])
            .ignore();

        return supply;
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe un insumo con ese nombre');
        throw error;
    }
};

exports.listSupplies = async () => {
    return await supplyRepo.getAllSupplies();
};