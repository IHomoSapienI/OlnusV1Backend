const supplyRepo = require('../repositories/supplyRepository');

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
        return await supplyRepo.insertSupply({
            name,
            supply_category_id,
            unit_id,
            minimum_stock: minimum_stock || 0
        });
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe un insumo con ese nombre');
        throw error;
    }
};

exports.listSupplies = async () => {
    return await supplyRepo.getAllSupplies();
};