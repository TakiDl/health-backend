const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    // 'id' is handled automatically by MongoDB as _id
    name: {
        type: String,
        required: true
    },
    category: String, // e.g., Breakfast, Lunch, Vegan
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    preparation_time: String, // e.g., "30 mins"
    preparation_tools: String, // e.g., "Blender, Oven"
    description: String,

    // This is the "Array of ingredients embedded"
    ingredients: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product' // Link to your Product collection
        },
        amount: {
            type: String,
            required: true // e.g., "200g" or "2 pieces"
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);

