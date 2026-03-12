// const mongoose = require('mongoose');

// const recipeSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     name: {
//         type: String,
//         required: true
//     },
//     category: String, // e.g., Breakfast, Lunch, Vegan
//     difficulty: {
//         type: String,
//         enum: ['Easy', 'Medium', 'Hard'],
//         default: 'Medium'
//     },
//     preparation_time: String, // e.g., "30 mins"
//     preparation_tools: String, // e.g., "Blender, Oven"
//     description: String,

//     // This is the "Array of ingredients embedded"
//     ingredients: [{
//         product: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Product' // Link to your Product collection
//         },
//         amount: {
//             type: String,
//             required: true // e.g., "200g" or "2 pieces"
//         }
//     }]
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Recipe', recipeSchema);

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
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    preparation_time: String,
    preparation_tools: String,

    // Embedded Ingredients
    ingredients: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        amount: { type: String, required: true }
    }],

    // 🌟 NEW: NUTRITION & IMAGES 🌟
    calories: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    imageUrl: { type: String, default: "https://via.placeholder.com/400x250?text=No+Image" } // Default placeholder if missing

}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);