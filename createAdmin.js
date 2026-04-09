// setupAdmin();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin'); // Make sure this path is correct

mongoose.connect('mongodb://127.0.0.1:27017/myApp')
    .then(async () => {
        console.log("Connected to MongoDB");

        // The password you want to use for the admin
        const plainTextPassword = "123456789";

        // 1. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainTextPassword, salt);

        // 2. Create the admin with the HASHED password
        const newAdmin = new Admin({
            name: "Main Admin",
            username: "admin123",
            password: hashedPassword // <-- Saving the secure hash!
        });

        await newAdmin.save();
        console.log("✅ Secure Admin created successfully!");
        process.exit();
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });