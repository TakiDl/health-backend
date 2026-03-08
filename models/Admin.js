const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    // Remember: MongoDB adds the 'id' automatically as _id
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Good practice: tracks when admins are created
});

// Fixed: Just pass adminSchema directly, no need for mongoose.Schema(adminSchema)
module.exports = mongoose.model('Admin', adminSchema);