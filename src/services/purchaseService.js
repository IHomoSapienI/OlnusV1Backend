const db = require('../database/knex');
const purchaseRepo = require('../repositories/purchaseRepository');
const inventoryService = require('./inventoryService'); 

exports.createPurchaseTransaction = async (purchaseData, detailsData, userEmail) => {
    // Initiate a transaction
    return await db.transaction(async (trx) => {
        
        
        const user = await trx('users').select('id').where('email', userEmail).first();
        if (!user) throw new Error('Usuario no encontrado');

        // purchase headers
        const purchase = await purchaseRepo.insertPurchase(trx, {
            user_id: user.id,
            supplier_id: purchaseData.supplier_id,
            purchase_number: purchaseData.purchase_number,
            subtotal: purchaseData.subtotal,
            tax: purchaseData.tax,
            total: purchaseData.total,
            status: 'effective'
        });

        // 3. set purchase details and update stock
        for (let item of detailsData) {
            const detail = await purchaseRepo.insertPurchaseDetail(trx, {
                purchase_id: purchase.id,
                supply_id: item.supply_id,
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                subtotal: item.quantity * item.unit_cost
            });

            // update stock
           await inventoryService.addStock(trx, 'supply', item.supply_id, item.quantity, detail.id, 'PURCHASE');
        }

        // if everything is fine, commit the transaction (COMMIT)
        return purchase;
    });
};