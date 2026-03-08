// const mongoose = require('mongoose');
// const Admin = require('./models/Admin'); // Adjust path if your Admin.js is somewhere else

// async function setupAdmin() {
//     try {
//         // 1. Connect to your local database
//         await mongoose.connect('mongodb://127.0.0.1:27017/myApp');
//         console.log("✅ Connected to MongoDB!");

//         // 2. Prevent creating duplicate admins
//         const existingAdmin = await Admin.findOne({ username: 'admin123' });
//         if (existingAdmin) {
//             console.log("⚠️ Admin already exists in the database.");
//             process.exit(0);
//         }

//         // 3. Create the admin data based on your Admin.js schema
//         const myAdmin = new Admin({
//             name: "Main Admin",
//             username: "admin123",
//             password: "supersecretpassword" // We are using plain text for now
//         });

//         // 4. Save to the database
//         await myAdmin.save();
//         console.log("🎉 Admin account successfully created in MongoDB!");

//     } catch (err) {
//         console.error("❌ Error creating admin:", err);
//     } finally {
//         // 5. Close the database connection so the script finishes
//         mongoose.connection.close();
//     }
// }

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