const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.post('/recipes', recipeController.createRecipe);
router.get('/recipes', recipeController.getAllRecipes);
router.get('/recipes/:id', recipeController.getRecipeDetails);
router.delete('/recipes/:id', recipeController.deleteRecipe);

module.exports = router;