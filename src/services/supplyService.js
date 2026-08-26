const supplyRepo = require('../repositories/supplyRepository');
const db = require('../database/knex'); // Para insertar en current_stock

// --- CATEGORÍAS ---
exports.createCategory = async (name, description) => {
    if (!name) throw new Error('El nombre de la categoría es obligatorio');
    
    try {
        return await supplyRepo.insertSupplyCategory({ name, description: description || null });
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe una categoría con ese nombre');
        throw error;
    }
};

exports.listCategories = async () => {
    return await supplyRepo.getAllSupplyCategories();
};

// --- INSUMOS ---
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

        // 2. Inicializar stock en 0 (NUEVO PASO)
        // e: Solo si no existe ninguna fila en current_stock para este insumo
        await db('current_stock')
            .insert({
                id: gen_random_uuid(), // Si no tienes 'gen_random_uuid' en Supabase, use 'crypto.randomUUID()' en código
                item_type: 'supply',
                item_id: supply.id,
                current_quantity: 0,
                updated_at: db.fn.now()
            })
            .onConflict(['item_type', 'item_id'])
            .ignore(); // Si ya está registrado, no hacer nada

        return supply;
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe un insumo con ese nombre');
        throw error;
    }
};

exports.listSupplies = async () => {
    return await supplyRepo.getAllSupplies();
};