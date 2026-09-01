const recipeRepo = require('../repositories/recipeRepository');
const db = require('../database/knex');

// Crear una nueva receta (con detalles)
exports.createRecipe = async (productId, details) => {
    if (!productId) throw new Error('ID de producto obligatorio');
    if (!details || details.length === 0) throw new Error('Detalles de receta obligatorios');

    try {
        return await db.transaction(async (trx) => {
            // 1. Insertar encabezado de receta
            const recipe = await recipeRepo.insertRecipe({
                product_id: productId,
                quantity_produced: 1, // Por defecto produce 1 unidad
                status: 'active'
            });

            // 2. Insertar detalles (para cada ingrediente)
            for (let item of details) {
                await recipeRepo.insertRecipeDetail({
                    recipe_id: recipe.id,
                    supply_id: item.supply_id,
                    quantity_required: item.quantity_required
                });
            }

            return recipe;
        });
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe una receta para este producto');
        throw error;
    }
};

// Listar todas las recetas
exports.getAllRecipes = async () => {
    return await recipeRepo.getAllRecipes();
};

// Obtener detalles de una receta por ID
exports.getRecipeDetails = async (recipeId) => {
    if (!recipeId) throw new Error('ID de receta obligatorio');
    return await recipeRepo.getRecipeDetails(recipeId);
};

// Eliminar una receta
exports.deleteRecipe = async (recipeId) => {
    if (!recipeId) throw new Error('ID de receta obligatorio');
    return await recipeRepo.deleteRecipe(recipeId);
};