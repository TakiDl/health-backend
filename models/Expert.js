// const mongoose = require('mongoose');

// const expertSchema = new mongoose.Schema({
//     // 'id' is handled automatically by MongoDB as _id
//     name: {
//         type: String,
//         required: true
//     },
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true // Removes accidental spaces
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     // This creates the link to the Patient model as a "Referenced Array"
//     supervised_patients: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Patient'
//     }]
// }, {
//     timestamps: true // Automatically adds createdAt and updatedAt fields
// });

// module.exports = mongoose.model('Expert', expertSchema);

// const mongoose = require('mongoose');

// const expertSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     username: { type: String, required: true, unique: true, trim: true },
//     password: { type: String, required: true },

//     // 🌟 NEW: By default, an expert is NOT verified
//     isVerified: { type: Boolean, default: false },

//     supervised_patients: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Patient'
//     }]
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Expert', expertSchema);






// // my-backend/models/Expert.js
// const mongoose = require('mongoose');

// const expertSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     username: { type: String, required: true, unique: true, trim: true },
//     password: { type: String, required: true },

//     // 🌟 Verification Fields
//     isVerified: { type: Boolean, default: false },
//     certificateUrl: { type: String, default: null }, // Link to their diploma

//     supervised_patients: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Patient'
//     }]
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Expert', expertSchema);




// my-backend/models/Expert.js
const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    // 🌟 Verification Fields
    isVerified: { type: Boolean, default: false },
    certificateUrl: { type: String, default: null }, // Link to their diploma

    // The active roster
    supervised_patients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }],

    // 🌟 NEW: MARKETPLACE PROFILE FIELDS 🌟
    specialty: { type: String, default: "Certified Nutritionist" },
    bio: { type: String, default: "Hi! I specialize in building custom, sustainable meal plans to help you reach your goals without giving up the foods you love." },

    // 🌟 NEW: CAPACITY LIMIT 🌟
    max_clients: { type: Number, default: 20 },

    // 🌟 NEW: THE WAITING ROOM 🌟
    pending_requests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model('Expert', expertSchema);