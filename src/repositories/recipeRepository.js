const db = require('../database/knex');

// Insertar encabezado de receta
exports.insertRecipe = async (data) => {
    const [recipe] = await db('recipes').insert(data).returning('*');
    return recipe;
};

// Insertar detalle de receta (1 insumo)
exports.insertRecipeDetail = async (data) => {
    const [detail] = await db('recipe_details').insert(data).returning('*');
    return detail;
};

// Listar recetas (с продуктами)
exports.getAllRecipes = async () => {
    return await db('recipes')
        .join('products', 'recipes.product_id', 'products.id')
        .select(
            'recipes.*',
            'products.name as product_name',
            'products.sale_price'
        )
        .orderBy('recipes.created_at', 'desc');
};

// Listar detalles de una receta (con insumos)
exports.getRecipeDetails = async (recipeId) => {
    return await db('recipe_details')
        .join('supplies', 'recipe_details.supply_id', 'supplies.id')
        .select(
            'recipe_details.*',
            'supplies.name as supply_name',
            'supplies.unit_id'
        )
        .orderBy('recipe_details.created_at', 'desc');
};

// Убрать запись receta (для удаления)
exports.deleteRecipe = async (recipeId) => {
    await db('recipe_details').where({ recipe_id: recipeId }).delete();
    await db('recipes').where({ id: recipeId }).delete();
};