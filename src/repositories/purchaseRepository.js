const db = require('../database/knex');

exports.insertPurchase = async (trx, purchaseData) => {
    const [purchase] = await trx('purchases').insert(purchaseData).returning('*');
    return purchase;
};

exports.insertPurchaseDetail = async (trx, detailData) => {
    const [detail] = await trx('purchase_details').insert(detailData).returning('*');
    return detail;
};