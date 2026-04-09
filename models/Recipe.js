// models/Recipe.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    // Core Info
    name: { type: String, required: true },
    description: String,

    // Categorization
    category: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], // Restrict to these 4 choices
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Raw'], // 🌟 Added 'Raw' for single products
        default: 'Medium'
    },
    preparation_time: String,
    preparation_tools: String,

    // 🌟 ADDED: SERVINGS FIELD FOR AUTO-CALCULATION 🌟
    servings: { type: Number, default: 1 },

    // 🌟 SYSTEM FLAG: Keeps individual products out of the master Admin/Expert lists 🌟
    isSystemLog: { type: Boolean, default: false },

    // Embedded Ingredients
    ingredients: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        amount: { type: String, required: true }
    }],

    // Images
    imageUrl: { type: String, default: "https://via.placeholder.com/400x250?text=No+Image" } // Default placeholder if missing

}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);