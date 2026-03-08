// models/PaymentRequest.js
const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    username: { type: String, required: true },
    requestedPlan: { type: String, enum: ['plus', 'pro'], required: true },
    receiptImage: { type: String, required: true }, // The filename of the image
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);