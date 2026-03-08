// const mongoose = require('mongoose');

// const patientSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },

//     // --- ADD THIS NEW FIELD ---
//     plan: {
//         type: String,
//         enum: ['free', 'plus', 'pro'],
//         default: 'free'
//     },
//     // --------------------------

//     age: Number,
//     weight: Number,
//     height: Number,
//     activity: String, // e.g., "Sedentary", "Active"

//     // weight_history (array of [day, weight])
//     weight_history: [{
//         day: { type: Date, default: Date.now },
//         weight: Number
//     }],

//     // Goals (wrapped in quotes to support dashes/spaces from your doc)
//     "Energy-Kcal_goal": Number,
//     "Carbohydrates_goal": Number,
//     "Sugar_goal": Number,
//     "Fat_goal": Number,
//     "Saturated Fat _goal": Number,
//     "Protein_goal": Number,
//     "Fiber_goal": Number,
//     "Magnesium_goal": Number,
//     "Calcium_goal": Number,
//     "Salt_goal": Number,
//     "Potassium_goal": Number,
//     "Sodium_goal": Number
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);

// // my-backend/models/Patient.js
// const mongoose = require('mongoose');

// const patientSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },

//     // --- PLAN FIELD ---
//     plan: {
//         type: String,
//         enum: ['free', 'plus', 'pro'],
//         default: 'free'
//     },
//     // ------------------

//     age: Number,
//     weight: Number,
//     height: Number,
//     activity: String, // e.g., "Sedentary", "Active"

//     // weight_history (array of [day, weight])
//     weight_history: [{
//         day: { type: Date, default: Date.now },
//         weight: Number
//     }],

//     // Goals (wrapped in quotes to support dashes/spaces)
//     "Energy-Kcal_goal": Number,
//     "Carbohydrates_goal": Number,
//     "Sugar_goal": Number,
//     "Fat_goal": Number,
//     "Saturated Fat _goal": Number,
//     "Protein_goal": Number,
//     "Fiber_goal": Number,
//     "Magnesium_goal": Number,
//     "Calcium_goal": Number,
//     "Salt_goal": Number,
//     "Potassium_goal": Number,
//     "Sodium_goal": Number,

//     // 🌟 NEW: Expert Recommended Meals (Step 1)
//     // We store the ID of the recipe so we can look up the details later
//     recommended_meals: {
//         breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
//         lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
//         dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }
//     }

// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);


// // my-backend/models/Patient.js
// const mongoose = require('mongoose');

// const patientSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },

//     // --- PLAN FIELD ---
//     plan: {
//         type: String,
//         enum: ['free', 'plus', 'pro'],
//         default: 'free'
//     },
//     // ------------------

//     age: Number,
//     weight: Number,
//     height: Number,
//     activity: String, // e.g., "Sedentary", "Active"

//     // weight_history (array of [day, weight])
//     weight_history: [{
//         day: { type: Date, default: Date.now },
//         weight: Number
//     }],

//     // Goals (wrapped in quotes to support dashes/spaces)
//     "Energy-Kcal_goal": Number,
//     "Carbohydrates_goal": Number,
//     "Sugar_goal": Number,
//     "Fat_goal": Number,
//     "Saturated Fat _goal": Number,
//     "Protein_goal": Number,
//     "Fiber_goal": Number,
//     "Magnesium_goal": Number,
//     "Calcium_goal": Number,
//     "Salt_goal": Number,
//     "Potassium_goal": Number,
//     "Sodium_goal": Number,

//     // 🌟 UPDATED FOR "FLEX MODE" (Array support)
//     // We added brackets [ ] so the app can stack multiple foods/recipes per meal!
//     recommended_meals: {
//         breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
//     }

// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);

// // my-backend/models/Patient.js
// const mongoose = require('mongoose');

// const patientSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },

//     // --- PLAN FIELD ---
//     plan: {
//         type: String,
//         enum: ['free', 'plus', 'pro'],
//         default: 'free'
//     },
//     // ------------------

//     age: Number,
//     weight: Number,
//     height: Number,
//     activity: String, // e.g., "Sedentary", "Active"

//     // weight_history (array of [day, weight])
//     weight_history: [{
//         day: { type: Date, default: Date.now },
//         weight: Number
//     }],

//     // Goals (wrapped in quotes to support dashes/spaces)
//     "Energy-Kcal_goal": Number,
//     "Carbohydrates_goal": Number,
//     "Sugar_goal": Number,
//     "Fat_goal": Number,
//     "Saturated Fat _goal": Number,
//     "Protein_goal": Number,
//     "Fiber_goal": Number,
//     "Magnesium_goal": Number,
//     "Calcium_goal": Number,
//     "Salt_goal": Number,
//     "Potassium_goal": Number,
//     "Sodium_goal": Number,

//     // 🌟 UPDATED FOR "FLEX MODE" & SNACKS CATEGORY
//     recommended_meals: {
//         breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }] // 🍏 ADDED SNACKS HERE
//     },

//     // 🌟 ADDED WATER AND RESET DATE FOR TRACKING
//     waterIntake: { type: Number, default: 0 },
//     last_reset_date: String

// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);

// // my-backend/models/Patient.js
// const mongoose = require('mongoose');

// const patientSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },

//     // --- PLAN FIELD ---
//     plan: {
//         type: String,
//         enum: ['free', 'plus', 'pro'],
//         default: 'free'
//     },
//     // ------------------

//     age: Number,
//     weight: Number,
//     height: Number,
//     activity: String, // e.g., "Sedentary", "Active"

//     // weight_history (array of [day, weight])
//     weight_history: [{
//         day: { type: Date, default: Date.now },
//         weight: Number
//     }],

//     // Goals (wrapped in quotes to support dashes/spaces)
//     "Energy-Kcal_goal": Number,
//     "Carbohydrates_goal": Number,
//     "Sugar_goal": Number,
//     "Fat_goal": Number,
//     "Saturated Fat _goal": Number,
//     "Protein_goal": Number,
//     "Fiber_goal": Number,
//     "Magnesium_goal": Number,
//     "Calcium_goal": Number,
//     "Salt_goal": Number,
//     "Potassium_goal": Number,
//     "Sodium_goal": Number,

//     // 🌟 UPDATED FOR "FLEX MODE" & SNACKS CATEGORY
//     recommended_meals: {
//         breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }] // 🍏 ADDED SNACKS HERE
//     },

//     // 🌟 ADDED WATER AND RESET DATE FOR TRACKING
//     waterIntake: { type: Number, default: 0 },

//     // 🌟 ADDED STEP INTAKE
//     stepIntake: { type: Number, default: 0 }, // Stores today's total steps

//     last_reset_date: String

// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);












// // my-backend/models/Patient.js
// const mongoose = require('mongoose');

// const patientSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },

//     // --- PLAN FIELD ---
//     plan: {
//         type: String,
//         enum: ['free', 'plus', 'pro'],
//         default: 'free'
//     },
//     // ------------------

//     age: Number,
//     weight: Number,
//     height: Number,
//     activity: String, // e.g., "Sedentary", "Active"

//     // weight_history (array of [day, weight])
//     weight_history: [{
//         day: { type: Date, default: Date.now },
//         weight: Number
//     }],

//     // Goals (wrapped in quotes to support dashes/spaces)
//     "Energy-Kcal_goal": Number,
//     "Carbohydrates_goal": Number,
//     "Sugar_goal": Number,
//     "Fat_goal": Number,
//     "Saturated Fat _goal": Number,
//     "Protein_goal": Number,
//     "Fiber_goal": Number,
//     "Magnesium_goal": Number,
//     "Calcium_goal": Number,
//     "Salt_goal": Number,
//     "Potassium_goal": Number,
//     "Sodium_goal": Number,

//     // 🌟 UPDATED FOR "FLEX MODE" & SNACKS CATEGORY
//     recommended_meals: {
//         breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }] // 🍏 ADDED SNACKS HERE
//     },

//     // 🌟 ADDED WATER AND RESET DATE FOR TRACKING
//     waterIntake: { type: Number, default: 0 },

//     // 🌟 ADDED STEP INTAKE
//     stepIntake: { type: Number, default: 0 }, // Stores today's total steps

//     last_reset_date: String,

//     // 🌟 NEW: HISTORICAL LOGS FOR PROGRESS CHARTS
//     historical_logs: [{
//         date: String, // e.g., "Mon Mar 02 2026"
//         kcal: Number,
//         protein: Number,
//         carbs: Number,
//         fat: Number
//     }]

// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);







// // my-backend/models/Patient.js
// const mongoose = require('mongoose');

// const patientSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },

//     // --- PLAN FIELD ---
//     plan: {
//         type: String,
//         enum: ['free', 'plus', 'pro'],
//         default: 'free'
//     },
//     // ------------------

//     age: Number,
//     weight: Number,
//     height: Number,
//     activity: String, // e.g., "Sedentary", "Active"

//     // weight_history (array of [day, weight])
//     weight_history: [{
//         day: { type: Date, default: Date.now },
//         weight: Number
//     }],

//     // Goals (wrapped in quotes to support dashes/spaces)
//     "Energy-Kcal_goal": Number,
//     "Carbohydrates_goal": Number,
//     "Sugar_goal": Number,
//     "Fat_goal": Number,
//     "Saturated Fat _goal": Number,
//     "Protein_goal": Number,
//     "Fiber_goal": Number,
//     "Magnesium_goal": Number,
//     "Calcium_goal": Number,
//     "Salt_goal": Number,
//     "Potassium_goal": Number,
//     "Sodium_goal": Number,

//     // 🌟 UPDATED FOR "FLEX MODE" & SNACKS CATEGORY
//     recommended_meals: {
//         breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//         snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }] // 🍏 ADDED SNACKS HERE
//     },

//     // 🌟 ADDED WATER AND RESET DATE FOR TRACKING
//     waterIntake: { type: Number, default: 0 },

//     // 🌟 ADDED STEP INTAKE
//     stepIntake: { type: Number, default: 0 }, // Stores today's total steps

//     last_reset_date: String,

//     // 🌟 NEW: HISTORICAL LOGS FOR PROGRESS CHARTS
//     historical_logs: [{
//         date: String, // e.g., "Mon Mar 02 2026"
//         kcal: Number,
//         protein: Number,
//         carbs: Number,
//         fat: Number
//     }],

//     // 🤝 NEW: THE DIGITAL HANDSHAKE FIELD
//     assigned_expert: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Expert',
//         default: null
//     }

// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);










// my-backend/models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    // 'id' is handled automatically by MongoDB as _id
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    // --- PLAN FIELD ---
    plan: {
        type: String,
        enum: ['free', 'plus', 'pro'],
        default: 'free'
    },
    // ------------------

    age: Number,
    weight: Number,
    height: Number,
    activity: String, // e.g., "Sedentary", "Active"

    // weight_history (array of [day, weight])
    weight_history: [{
        day: { type: Date, default: Date.now },
        weight: Number
    }],

    // Goals (wrapped in quotes to support dashes/spaces)
    "Energy-Kcal_goal": Number,
    "Carbohydrates_goal": Number,
    "Sugar_goal": Number,
    "Fat_goal": Number,
    "Saturated Fat _goal": Number,
    "Protein_goal": Number,
    "Fiber_goal": Number,
    "Magnesium_goal": Number,
    "Calcium_goal": Number,
    "Salt_goal": Number,
    "Potassium_goal": Number,
    "Sodium_goal": Number,

    // 🌟 UPDATED FOR "FLEX MODE" & SNACKS CATEGORY
    recommended_meals: {
        breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
        lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
        dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
        snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }] // 🍏 ADDED SNACKS HERE
    },

    // 🌟 ADDED WATER AND RESET DATE FOR TRACKING
    waterIntake: { type: Number, default: 0 },

    // 🌟 ADDED STEP INTAKE
    stepIntake: { type: Number, default: 0 }, // Stores today's total steps

    last_reset_date: String,

    // 🌟 NEW: HISTORICAL LOGS FOR PROGRESS CHARTS
    historical_logs: [{
        date: String, // e.g., "Mon Mar 02 2026"
        kcal: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    }],

    // 🤝 THE DIGITAL HANDSHAKE FIELD
    assigned_expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert',
        default: null
    },

    // ⏳ NEW: THE PENDING REQUEST FIELD
    pending_expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert',
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);