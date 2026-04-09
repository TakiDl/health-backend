// // models/Patient.js
// const mongoose = require('mongoose');

// // 🌟 NEW: We create a reusable schema for a single day of meals
// const mealDaySchema = {
//     breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//     lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//     dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
//     snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
// };

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
//     // 🌟 ADDED FOR METABOLIC MATH 🌟
//     gender: {
//         type: String,
//         enum: ['Male', 'Female'],
//         default: 'Male'
//     },
//     activity: {
//         type: String,
//         enum: ['sedentary', 'slightly active', 'moderately active', 'very active', 'extra active'],
//         default: 'sedentary'
//     },

//     // 🌟 NEW: Daily financial limit for the Coach to reference
//     daily_budget: {
//         type: Number,
//         default: 0
//     },

//     // 🌟 NEW: Pro Patient Contact & Intentions 🌟
//     email: { type: String, trim: true },
//     phone: { type: String, trim: true },
//     goal_intention: {
//         type: String,
//         enum: ['Cut', 'Maintain', 'Bulk'],
//         default: 'Maintain'
//     },

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

//     // 🌟 LEGACY SYSTEM: Acts as "Today's Actual Log" (Keeps the app running perfectly during transition)
//     recommended_meals: mealDaySchema,

//     // 🌟 NEW PREMIUM SYSTEM: "The 7-Day Coach Calendar" (Phase 1) 🌟
//     weekly_plan: {
//         monday: mealDaySchema,
//         tuesday: mealDaySchema,
//         wednesday: mealDaySchema,
//         thursday: mealDaySchema,
//         friday: mealDaySchema,
//         saturday: mealDaySchema,
//         sunday: mealDaySchema
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

//     // 🤝 THE DIGITAL HANDSHAKE FIELD
//     assigned_expert: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Expert',
//         default: null
//     },

//     // ⏳ NEW: THE PENDING REQUEST FIELD
//     pending_expert: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Expert',
//         default: null
//     }

// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);



// models/Patient.js
const mongoose = require('mongoose');

// 🌟 REUSABLE SCHEMA FOR MEALS
const mealDaySchema = {
    breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
};

const patientSchema = new mongoose.Schema({
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

    age: Number,
    weight: Number,
    height: Number,

    gender: {
        type: String,
        enum: ['Male', 'Female'],
        default: 'Male'
    },
    activity: {
        type: String,
        enum: ['sedentary', 'slightly active', 'moderately active', 'very active', 'extra active'],
        default: 'sedentary'
    },

    daily_budget: {
        type: Number,
        default: 0
    },

    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    goal_intention: {
        type: String,
        enum: ['Cut', 'Maintain', 'Bulk'],
        default: 'Maintain'
    },

    weight_history: [{
        day: { type: Date, default: Date.now },
        weight: Number
    }],

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

    recommended_meals: mealDaySchema,

    weekly_plan: {
        monday: mealDaySchema,
        tuesday: mealDaySchema,
        wednesday: mealDaySchema,
        thursday: mealDaySchema,
        friday: mealDaySchema,
        saturday: mealDaySchema,
        sunday: mealDaySchema
    },

    waterIntake: { type: Number, default: 0 },
    stepIntake: { type: Number, default: 0 },
    last_reset_date: String,

    // 🌟 NEW OFFICIAL FIELD: Tracks when the coach last updated the 7-Day Menu
    last_meal_update: { type: String, default: null },

    historical_logs: [{
        date: String,
        kcal: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    }],

    assigned_expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert',
        default: null
    },

    pending_expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert',
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
