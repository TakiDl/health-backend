const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    Barcode: String,
    Brand: String,
    Price: Number,
    "Product Name": String,
    "Energy-Kcal": Number,
    Carbohydrates: Number,
    Sugars: Number,
    Fat: Number,
    "Saturated-Fat": Number,
    Proteins: Number,
    Fiber: Number,
    "Magnesium(mg)": Number,
    "Calcium(mg)": Number,
    Salt: Number,
    "Potassium(mg)": Number,
    "Sodium(mg)": Number,
    "Nutrition-Score-Fr": String,
    "Nova-Group": Number
});

module.exports = mongoose.model('Product', productSchema);