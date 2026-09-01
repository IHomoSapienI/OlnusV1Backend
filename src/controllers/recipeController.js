const recipeService = require('../services/recipeService');

// POST /api/recipes
exports.createRecipe = async (req, res) => {
    try {
        const { product_id, details } = req.body;

        // Validación
        if (!product_id || !details || details.length === 0) {
            return res.status(400).json({ error: 'Producto y detalles obligatorios' });
        }

        const result = await recipeService.createRecipe(product_id, details);

        res.status(201).json({ message: 'Receta creada exitosamente', data: result });
    } catch (error) {
        console.error('Error en recipe:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/recipes
exports.getAllRecipes = async (req, res) => {
    try {
        const result = await recipeService.getAllRecipes();
        res.json(result);
    } catch (error) {
        console.error('Error listing recipes:', error);
        res.status(500).json({ error: 'Error al obtener recipes' });
    }
};

// GET /api/recipes/:id
exports.getRecipeDetails = async (req, res) => {
    try {
        const result = await recipeService.getRecipeDetails(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error getting recipe details:', error);
        res.status(500).json({ error: 'Error al obtener detalles de la receta' });
    }
};

// DELETE /api/recipes/:id
exports.deleteRecipe = async (req, res) => {
    try {
        await recipeService.deleteRecipe(req.params.id);
        res.status(200).json({ message: 'Receta eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Error al eliminar receta' });
    }
};