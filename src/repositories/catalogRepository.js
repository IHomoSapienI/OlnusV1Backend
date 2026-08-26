const db = require('../database/knex');

// ================================================
// SUPPLY CATEGORIES (Categorías de Insumos)
// ================================================
exports.insertSupplyCategory = async (trx, data) => {
    const [category] = await trx('supply_categories').insert(data).returning('*');
    return category;
};

exports.getAllSupplyCategories = async () => {
    return await db('supply_categories').orderBy('created_at', 'desc');
};

// ================================================
// PRODUCT CATEGORIES (Categorías de Productos)
// ================================================
exports.insertProductCategory = async (trx, data) => {
    const [category] = await trx('product_categories').insert(data).returning('*');
    return category;
};

exports.getAllProductCategories = async () => {
    return await db('product_categories').orderBy('created_at', 'desc');
};

// ================================================
// UNITS OF MEASURE (Unidades de Medida)
// ================================================
exports.insertUnitOfMeasure = async (trx, data) => {
    const [unit] = await trx('units_of_measure').insert(data).returning('*');
    return unit;
};

exports.getAllUnitsOfMeasure = async () => {
    return await db('units_of_measure').orderBy('created_at', 'desc');
};