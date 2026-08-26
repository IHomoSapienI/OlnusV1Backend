const db = require('../database/knex');
const catalogRepo = require('../repositories/catalogRepository');

// ================================================
// SUPPLY CATEGORIES
// ================================================
exports.createSupplyCategory = async (data) => {
    try {
        if (!data.name) throw new Error('Nombre obligatorio');
        return await db.transaction(async (trx) => {
            return await catalogRepo.insertSupplyCategory(trx, {
                name: data.name,
                description: data.description || null,
                status: 'active'
            });
        });
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe una categoría con ese nombre');
        throw error;
    }
};

exports.getAllSupplyCategories = async () => {
    return await catalogRepo.getAllSupplyCategories();
};

// ================================================
// PRODUCT CATEGORIES
// ================================================
exports.createProductCategory = async (data) => {
    try {
        if (!data.name) throw new Error('Nombre obligatorio');
        return await db.transaction(async (trx) => {
            return await catalogRepo.insertProductCategory(trx, {
                name: data.name,
                description: data.description || null,
                status: 'active'
            });
        });
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe una categoría con ese nombre');
        throw error;
    }
};

exports.getAllProductCategories = async () => {
    return await catalogRepo.getAllProductCategories();
};

// ================================================
// UNITS OF MEASURE
// ================================================
exports.createUnitOfMeasure = async (data) => {
    try {
        if (!data.name || !data.abbreviation) throw new Error('Nombre y abreviación obligatorios');
        return await db.transaction(async (trx) => {
            return await catalogRepo.insertUnitOfMeasure(trx, {
                name: data.name,
                abbreviation: data.abbreviation,
                status: 'active'
            });
        });
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe una unidad con ese nombre');
        throw error;
    }
};

exports.getAllUnitsOfMeasure = async () => {
    return await catalogRepo.getAllUnitsOfMeasure();
};