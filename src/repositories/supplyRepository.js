const db = require('../database/knex');

// --- CATEGORÍAS DE INSUMOS ---
exports.insertSupplyCategory = async (categoryData) => {
    const [category] = await db('supply_categories').insert(categoryData).returning('*');
    return category;
};

exports.getAllSupplyCategories = async () => {
    return await db('supply_categories').select('*').orderBy('name');
};

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
            'units_of_measure.abbreviation as unit_abbreviation'
        )
        .orderBy('supplies.name');
};