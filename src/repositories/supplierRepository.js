const db = require('../database/knex');

// Crear un proveedor
exports.insertSupplier = async (trx, supplierData) => {
    const [supplier] = await trx('suppliers').insert(supplierData).returning('*');
    return supplier;
};

// Listar todos los proveedores (solo activos)
exports.getAllSuppliers = async () => {
    return await db('suppliers')
        .whereNull('deleted_at') // Soft delete
        .orderBy('created_at', 'desc');
};

// Listar proveedores que venden un insumo específico (para la compra)
exports.getSuppliersBySupplyId = async (supplyId) => {
    return await db('suppliers')
        .join('supplier_supplies', 'suppliers.id', 'supplier_supplies.supplier_id')
        .where('supplier_supplies.supply_id', supplyId)
        .whereNull('suppliers.deleted_at')
        .select('suppliers.*')
        .orderBy('suppliers.created_at', 'desc');
};

// Buscar por ID
exports.getSupplierById = async (id) => {
    return await db('suppliers').where({ id, deleted_at: null }).first();
};