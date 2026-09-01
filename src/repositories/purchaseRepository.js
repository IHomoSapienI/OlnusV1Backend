const db = require('../database/knex');

// Create purchase header
exports.insertPurchase = async (trx, purchaseData) => {
    const [purchase] = await trx('purchases').insert(purchaseData).returning('*');
    return purchase;
};

// Create purchase detail
exports.insertPurchaseDetail = async (trx, detailData) => {
    const [detail] = await trx('purchase_details').insert(detailData).returning('*');
    return detail;
};

// List all purchases (with supplier)
exports.getAllPurchases = async () => {
    return await db('purchases')
        .join('suppliers', 'purchases.supplier_id', 'suppliers.id')
        .select('purchases.*', 'suppliers.name as supplier_name')
        .orderBy('purchases.created_at', 'desc');
};

// List details of a purchase
exports.getPurchaseDetails = async (purchaseId) => {
    return await db('purchase_details')
        .join('supplies', 'purchase_details.supply_id', 'supplies.id')
        .select('purchase_details.*', 'supplies.name as supply_name')
        .orderBy('purchase_details.created_at', 'desc');
};