const db = require('../database/knex');

// --- INSUMOS ---
exports.insertSupply = async (supplyData) => {
    const [supply] = await db('supplies').insert(supplyData).returning('*');
    return supply;
};

exports.getAllSupplies = async () => {
    return await db('supplies')
        .join('supply_categories', 'supplies.supply_category_id', 'supply_categories.id')
        .join('units_of_measure', 'supplies.unit_id', 'units_of_measure.id')
        .select(
            'supplies.*',
            'supply_categories.name as category_name',
            'units_of_measure.name as unit_name',
            'units_of_measure.abbreviation as unit_abbreviation',
            // En lugar de current_stock.supply_id, ahora usamos item_type + item_id
            'current_stock.current_quantity',
            'current_stock.updated_at'
        )
        .leftJoin('current_stock', function() {
            this.on('current_stock.item_type', '=', db.raw("'supply'"))
                .andOn('current_stock.item_id', '=', 'supplies.id');
        })
        .orderBy('supplies.name');
};