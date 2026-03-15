// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');      // <-- ADD THIS
// const jwt = require('jsonwebtoken');   // <-- ADD THIS
// // Add a secret key for your tokens (usually this goes in a .env file, but this is fine for now)
// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient'); // Added Patient model
// const Expert = require('./models/Expert');   // Added Expert model
// const Recipe = require('./models/Recipe');

// const app = express();
// const PORT = 3000;

// // 1. MIDDLEWARE
// app.use(cors());
// app.use(express.json());

// // 2. MONGODB CONNECTION
// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// // 3. ROUTES
// app.get('/', (req, res) => {
//     res.send("Server is working");
// });

// app.get('/test', (req, res) => {
//     res.json({ message: "Test route works", timestamp: new Date() });
// });

// // // MAIN PRODUCTS SEARCH ROUTE
// // app.get('/products', async (req, res) => {
// //     try {
// //         const { search } = req.query;
// //         let query = {};

// //         if (search && search.trim() !== "") {
// //             query = {
// //                 $or: [
// //                     { "Product Name": { $regex: search, $options: 'i' } },
// //                     { "Brand": { $regex: search, $options: 'i' } }
// //                 ]
// //             };
// //         }

// //         const results = await Product.find(query).limit(20);
// //         res.json(results);
// //     } catch (err) {
// //         console.error("Search Error:", err);
// //         res.status(500).json({ error: err.message });
// //     }
// // });

// // MAIN PRODUCTS SEARCH ROUTE (WITH DEBUG LOGS)
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         // 1. Search by Name or Brand
//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }

//         // 2. Search by Category
//         if (req.query.category && req.query.category.trim() !== "") {
//             // NOTE: Since your schema does NOT have a "Category" field yet,
//             // typing anything in the Category box will return 0 results!
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         // 3. Helper function to process Min/Max queries
//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];

//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         // 4. MAP FRONTEND KEYS TO EXACT MONGODB SCHEMA FIELDS
//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));

//         // 5. Execute query
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // --- NEW ROLE-BASED SIGNUP ROUTE (SECURED WITH BCRYPT) ---
// app.post('/signup', async (req, res) => {
//     try {
//         // 1. Accept 'plan' and other data from the mobile app
//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         // 2. Hash the password before saving!
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             // 3. Save the plan to the new Patient document using the HASHED password
//             const newPatient = new Patient({
//                 name,
//                 username,
//                 password: hashedPassword, // <-- Using the scrambled password here
//                 age,
//                 weight,
//                 height,
//                 plan
//             });
//             await newPatient.save();
//             return res.status(201).json({ message: "Client account created!" });

//         } else if (role === 'expert') {
//             // 4. Save Expert using the HASHED password
//             const newExpert = new Expert({
//                 name,
//                 username,
//                 password: hashedPassword // <-- Using the scrambled password here
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert account created!" });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// // --- UPGRADED SECURE ROLE-BASED LOGIN ROUTE ---
// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = ''; // Variable to hold the plan

//         // 1. Check Admin
//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         // // 2. Check Expert
//         // if (!user) {
//         //     user = await Expert.findOne({ username });
//         //     if (user) role = 'expert';
//         // }

//         // 2. Check Expert
//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';

//                 // 🌟 NEW: Verification Check
//                 if (user.isVerified === false) {
//                     return res.status(403).json({
//                         message: "Account pending approval. Please wait for Admin verification."
//                     });
//                 }
//             }
//         }

//         // 3. Check Client (Patient)
//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan; // Grab their plan from the database
//             }
//         }

//         // 4. If no user is found at all
//         if (!user) {
//             return res.status(401).json({ message: "Invalid username or password" });
//         }

//         // 5. Check the hashed password! 
//         // bcrypt handles unscrambling and comparing the entered password to the DB hash
//         const isPasswordValid = await bcrypt.compare(password, user.password);

//         if (!isPasswordValid) {
//             return res.status(401).json({ message: "Invalid username or password" });
//         }

//         // 6. Generate the JWT (The "Digital ID Badge")
//         const tokenPayload = {
//             userId: user._id,
//             role: role,
//             plan: plan
//         };

//         // Token expires in 7 days
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         // 7. Send success response back to the mobile app
//         res.json({
//             message: "Login successful",
//             token: token,      // <-- Sending the generated token!
//             role: role,
//             plan: plan,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 username: user.username
//             }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // --- ADMIN: GET ALL PATIENTS ---
// app.get('/patients', async (req, res) => {
//     try {
//         // We use .select('-password') so we don't send passwords to the mobile app for security!
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) {
//         console.error("Fetch Patients Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // --- ADMIN: UPDATE A PATIENT ---
// app.put('/patients/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         // Find the patient by ID and update them with the new data sent from the app
//         const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) {
//         console.error("Update Patient Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // --- ADMIN: DELETE A PATIENT ---
// app.delete('/patients/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const deletedPatient = await Patient.findByIdAndDelete(id);
//         if (!deletedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) {
//         console.error("Delete Patient Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- ADMIN: RECIPE MANAGEMENT ROUTES ---
// // ==========================================

// // 1. GET ALL RECIPES
// app.get('/recipes', async (req, res) => {
//     try {
//         // FIXED: removing the specific field selection fixes the "Space in Name" bug
//         const recipes = await Recipe.find()
//             .populate('ingredients.product');

//         res.json(recipes);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 2. ADD A NEW RECIPE
// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 3. UPDATE A RECIPE
// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedRecipe) return res.status(404).json({ message: "Recipe not found" });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 4. DELETE A RECIPE
// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
//         if (!deletedRecipe) return res.status(404).json({ message: "Recipe not found" });
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- ADMIN: PRODUCT MANAGEMENT ROUTES ---
// // ==========================================

// // 1. ADD A NEW PRODUCT
// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 2. UPDATE A PRODUCT
// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 3. DELETE A PRODUCT
// app.delete('/products/:id', async (req, res) => {
//     try {
//         const deletedProduct = await Product.findByIdAndDelete(req.params.id);
//         if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
//         res.json({ message: "Product deleted!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- ADMIN: EXPERT MANAGEMENT ROUTES ---
// // ==========================================

// // 1. GET ALL EXPERTS
// app.get('/experts', async (req, res) => {
//     try {
//         // We use .populate() to get the actual patient data, 
//         // and .select('-password') so we don't accidentally leak passwords to the app!
//         const experts = await Expert.find()
//             .populate('supervised_patients', 'name username')
//             .select('-password');
//         res.json(experts);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 2. ADD A NEW EXPERT
// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) {
//         // Catch duplicate username error from MongoDB
//         if (err.code === 11000) return res.status(400).json({ message: "Username already exists!" });
//         res.status(500).json({ error: err.message });
//     }
// });

// // 3. UPDATE AN EXPERT
// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         if (!updatedExpert) return res.status(404).json({ message: "Expert not found" });
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) {
//         if (err.code === 11000) return res.status(400).json({ message: "Username already exists!" });
//         res.status(500).json({ error: err.message });
//     }
// });

// // 4. DELETE AN EXPERT
// app.delete('/experts/:id', async (req, res) => {
//     try {
//         const deletedExpert = await Expert.findByIdAndDelete(req.params.id);
//         if (!deletedExpert) return res.status(404).json({ message: "Expert not found" });
//         res.json({ message: "Expert deleted!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer'); // 1️⃣ Import Multer
// const path = require('path');     // 1️⃣ Import Path

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');

// const app = express();
// const PORT = 3000;

// // 1. MIDDLEWARE
// app.use(cors());
// app.use(express.json());

// // 2️⃣ MAKE UPLOADS FOLDER PUBLIC (So the App can view the images)
// // This allows the app to load images like: http://192.168.1.102:3000/uploads/expert-123.jpg
// app.use('/uploads', express.static('uploads'));

// // 3️⃣ CONFIGURE MULTER (File Storage Engine)
// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         // Create unique name: "expert-TIMESTAMP-OriginalName.extension"
//         cb(null, 'expert-' + Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });

// // 2. MONGODB CONNECTION
// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// // 3. ROUTES
// app.get('/', (req, res) => {
//     res.send("Server is working");
// });

// app.get('/test', (req, res) => {
//     res.json({ message: "Test route works", timestamp: new Date() });
// });

// // MAIN PRODUCTS SEARCH ROUTE (WITH DEBUG LOGS)
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         // 1. Search by Name or Brand
//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }

//         // 2. Search by Category
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         // 3. Helper function to process Min/Max queries
//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];

//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         // 4. MAP FRONTEND KEYS TO EXACT MONGODB SCHEMA FIELDS
//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));

//         // 5. Execute query
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // --- UPDATED SIGNUP ROUTE (HANDLES FILES) ---
// // We use 'upload.single' to accept 1 file named 'certificate'
// // This middleware processes the file BEFORE the rest of your function runs
// app.post('/signup', upload.single('certificate'), async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);
//         if (req.file) console.log("File Uploaded:", req.file.path);

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         // 2. Hash the password before saving!
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             const newPatient = new Patient({
//                 name,
//                 username,
//                 password: hashedPassword,
//                 age,
//                 weight,
//                 height,
//                 plan
//             });
//             await newPatient.save();
//             return res.status(201).json({ message: "Client account created!" });

//         } else if (role === 'expert') {
//             // 4️⃣ SAVE EXPERT WITH CERTIFICATE PATH
//             // If a file was uploaded, save its path. 
//             // We replace backslashes (Windows) with forward slashes for URLs.
//             const certPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name,
//                 username,
//                 password: hashedPassword,
//                 isVerified: false, // Explicitly set to false (waiting for admin)
//                 certificateUrl: certPath // Save the link to the file!
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// // --- UPGRADED SECURE ROLE-BASED LOGIN ROUTE ---
// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         // 1. Check Admin
//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         // 2. Check Expert
//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';

//                 // 🌟 NEW: Verification Check
//                 if (user.isVerified === false) {
//                     return res.status(403).json({
//                         message: "Account pending approval. Please wait for Admin verification."
//                     });
//                 }
//             }
//         }

//         // 3. Check Client (Patient)
//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         // 4. If no user is found at all
//         if (!user) {
//             return res.status(401).json({ message: "Invalid username or password" });
//         }

//         // 5. Check the hashed password! 
//         const isPasswordValid = await bcrypt.compare(password, user.password);

//         if (!isPasswordValid) {
//             return res.status(401).json({ message: "Invalid username or password" });
//         }

//         // 6. Generate the JWT (The "Digital ID Badge")
//         const tokenPayload = {
//             userId: user._id,
//             role: role,
//             plan: plan
//         };

//         // Token expires in 7 days
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         // 7. Send success response back to the mobile app
//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 username: user.username
//             }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // --- ADMIN: GET ALL PATIENTS ---
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) {
//         console.error("Fetch Patients Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // --- ADMIN: UPDATE A PATIENT ---
// app.put('/patients/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) {
//         console.error("Update Patient Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // --- ADMIN: DELETE A PATIENT ---
// app.delete('/patients/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const deletedPatient = await Patient.findByIdAndDelete(id);
//         if (!deletedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) {
//         console.error("Delete Patient Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- ADMIN: RECIPE MANAGEMENT ROUTES ---
// // ==========================================

// // 1. GET ALL RECIPES
// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find()
//             .populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 2. ADD A NEW RECIPE
// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 3. UPDATE A RECIPE
// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedRecipe) return res.status(404).json({ message: "Recipe not found" });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 4. DELETE A RECIPE
// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
//         if (!deletedRecipe) return res.status(404).json({ message: "Recipe not found" });
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- ADMIN: PRODUCT MANAGEMENT ROUTES ---
// // ==========================================

// // 1. ADD A NEW PRODUCT
// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 2. UPDATE A PRODUCT
// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 3. DELETE A PRODUCT
// app.delete('/products/:id', async (req, res) => {
//     try {
//         const deletedProduct = await Product.findByIdAndDelete(req.params.id);
//         if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
//         res.json({ message: "Product deleted!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- ADMIN: EXPERT MANAGEMENT ROUTES ---
// // ==========================================

// // 1. GET ALL EXPERTS
// app.get('/experts', async (req, res) => {
//     try {
//         // We use .populate() to get the actual patient data, 
//         // and .select('-password') so we don't accidentally leak passwords to the app!
//         const experts = await Expert.find()
//             .populate('supervised_patients', 'name username')
//             .select('-password');
//         res.json(experts);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 2. ADD A NEW EXPERT (Basic Add)
// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) {
//         if (err.code === 11000) return res.status(400).json({ message: "Username already exists!" });
//         res.status(500).json({ error: err.message });
//     }
// });

// // 3. UPDATE AN EXPERT (Used for Verification too!)
// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         if (!updatedExpert) return res.status(404).json({ message: "Expert not found" });
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) {
//         if (err.code === 11000) return res.status(400).json({ message: "Username already exists!" });
//         res.status(500).json({ error: err.message });
//     }
// });

// // 4. DELETE AN EXPERT
// app.delete('/experts/:id', async (req, res) => {
//     try {
//         const deletedExpert = await Expert.findByIdAndDelete(req.params.id);
//         if (!deletedExpert) return res.status(404).json({ message: "Expert not found" });
//         res.json({ message: "Expert deleted!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });






// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));


// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });


// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });


// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });


// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });


// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         // 🌟 DEEP POPULATION: We fetch the meals, AND the products inside those meals!
//         const patient = await Patient.findById(req.params.id)
//             .populate({
//                 path: 'recommended_meals.breakfast',
//                 populate: { path: 'ingredients.product' } // Digging into the ingredients!
//             })
//             .populate({
//                 path: 'recommended_meals.lunch',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.dinner',
//                 populate: { path: 'ingredients.product' }
//             })
//             .select('-password');

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         // --- CALCULATE REAL CONSUMED MACROS FROM INGREDIENTS ---
//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (meal) => {
//             if (!meal || !meal.ingredients) return;

//             meal.ingredients.forEach(item => {
//                 const prod = item.product;
//                 if (prod) {
//                     // Extract the numeric value from strings like "200g" or "1.5 cups"
//                     const amountString = item.amount || "100";
//                     const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;

//                     // Assuming your product database nutritional values are PER 100g:
//                     // (If your DB values are per 1 gram or per serving, change this to multiplier = numericAmount)
//                     const multiplier = numericAmount / 100;

//                     consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                     consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                     consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                     consumedFat += (prod['Fat'] || 0) * multiplier;
//                     consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                 }
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//         }

//         const dashboardData = {
//             name: patient.name,
//             // Targets
//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],
//             // Consumed (Rounded to avoid long decimals)
//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },
//             // Other Data
//             weight_history: patient.weight_history || [],
//             weight: patient.weight
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });





// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));


// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });


// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });


// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });


// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });


// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         // 🌟 DEEP POPULATION: We fetch the meals, AND the products inside those meals!
//         const patient = await Patient.findById(req.params.id)
//             .populate({
//                 path: 'recommended_meals.breakfast',
//                 populate: { path: 'ingredients.product' } // Digging into the ingredients!
//             })
//             .populate({
//                 path: 'recommended_meals.lunch',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.dinner',
//                 populate: { path: 'ingredients.product' }
//             })
//             .select('-password');

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         // --- CALCULATE REAL CONSUMED MACROS FROM INGREDIENTS ---
//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (meal) => {
//             if (!meal || !meal.ingredients) return;

//             meal.ingredients.forEach(item => {
//                 const prod = item.product;
//                 if (prod) {
//                     // Extract the numeric value from strings like "200g" or "1.5 cups"
//                     const amountString = item.amount || "100";
//                     const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;

//                     // Assuming your product database nutritional values are PER 100g:
//                     // (If your DB values are per 1 gram or per serving, change this to multiplier = numericAmount)
//                     const multiplier = numericAmount / 100;

//                     consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                     consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                     consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                     consumedFat += (prod['Fat'] || 0) * multiplier;
//                     consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                 }
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,       // 🌟 ADDED THIS LINE
//             height: patient.height, // 🌟 ADDED THIS LINE

//             // Targets
//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],
//             // Consumed (Rounded to avoid long decimals)
//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },
//             // Other Data
//             weight_history: patient.weight_history || [],
//             weight: patient.weight
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });





// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- 🌟 NEW: PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         // Update the patient's specific goal fields in MongoDB
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": kcal,
//             "Protein_goal": protein,
//             "Carbohydrates_goal": carbs,
//             "Fat_goal": fat
//         }, { new: true });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({
//                 path: 'recommended_meals.breakfast',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.lunch',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.dinner',
//                 populate: { path: 'ingredients.product' }
//             })
//             .select('-password');

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (meal) => {
//             if (!meal || !meal.ingredients) return;

//             meal.ingredients.forEach(item => {
//                 const prod = item.product;
//                 if (prod) {
//                     const amountString = item.amount || "100";
//                     const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                     const multiplier = numericAmount / 100;

//                     consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                     consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                     consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                     consumedFat += (prod['Fat'] || 0) * multiplier;
//                     consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                 }
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             // Targets
//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],
//             // Consumed 
//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },
//             // Other Data
//             weight_history: patient.weight_history || [],
//             weight: patient.weight
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- 🌟 NEW: PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         // 🌟 FIX: Added Number() to ensure math works, and { strict: false } to force MongoDB to save!
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({
//                 path: 'recommended_meals.breakfast',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.lunch',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.dinner',
//                 populate: { path: 'ingredients.product' }
//             })
//             .select('-password');

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (meal) => {
//             if (!meal || !meal.ingredients) return;

//             meal.ingredients.forEach(item => {
//                 const prod = item.product;
//                 if (prod) {
//                     const amountString = item.amount || "100";
//                     const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                     const multiplier = numericAmount / 100;

//                     consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                     consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                     consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                     consumedFat += (prod['Fat'] || 0) * multiplier;
//                     consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                 }
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             // Targets
//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],
//             // Consumed 
//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },
//             // Other Data
//             weight_history: patient.weight_history || [],
//             weight: patient.weight
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- 🌟 NEW: PATIENT LOG MEAL (PLUS PLAN) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;
//         // mealType will be 'breakfast', 'lunch', or 'dinner'

//         // Prepare the exact field to update (e.g., recommended_meals.breakfast)
//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         // Update the patient in the database
//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { $set: updateQuery },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({
//                 path: 'recommended_meals.breakfast',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.lunch',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.dinner',
//                 populate: { path: 'ingredients.product' }
//             })
//             .select('-password');

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (meal) => {
//             if (!meal || !meal.ingredients) return;

//             meal.ingredients.forEach(item => {
//                 const prod = item.product;
//                 if (prod) {
//                     const amountString = item.amount || "100";
//                     const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                     const multiplier = numericAmount / 100;

//                     consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                     consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                     consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                     consumedFat += (prod['Fat'] || 0) * multiplier;
//                     consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                 }
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             // Targets
//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],
//             // Consumed 
//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },
//             // Other Data
//             weight_history: patient.weight_history || [],
//             weight: patient.weight
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- 🌟 NEW: PATIENT LOG MEAL (PLUS PLAN) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;
//         // mealType will be 'breakfast', 'lunch', or 'dinner'

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { $set: updateQuery },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- 🌟 NEW: UPDATE WATER INTAKE ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({
//                 path: 'recommended_meals.breakfast',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.lunch',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.dinner',
//                 populate: { path: 'ingredients.product' }
//             })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         // DAILY "MIDNIGHT RESET" LOGIC
//         if (patient.plan === 'plus' || patient.plan === 'free') {
//             const todayStr = new Date().toDateString();

//             if (patient.last_reset_date !== todayStr) {
//                 await Patient.findByIdAndUpdate(patient._id, {
//                     $set: {
//                         "recommended_meals.breakfast": null,
//                         "recommended_meals.lunch": null,
//                         "recommended_meals.dinner": null,
//                         "waterIntake": 0, // 🌟 Clear water intake at midnight too!
//                         "last_reset_date": todayStr
//                     }
//                 }, { strict: false });

//                 patient.recommended_meals = { breakfast: null, lunch: null, dinner: null };
//                 patient.waterIntake = 0;
//             }
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (meal) => {
//             if (!meal || !meal.ingredients) return;

//             meal.ingredients.forEach(item => {
//                 const prod = item.product;
//                 if (prod) {
//                     const amountString = item.amount || "100";
//                     const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                     const multiplier = numericAmount / 100;

//                     consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                     consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                     consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                     consumedFat += (prod['Fat'] || 0) * multiplier;
//                     consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                 }
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             // 🌟 SEND THE SAVED WATER INTAKE BACK TO THE MOBILE APP
//             waterIntake: patient.waterIntake || 0
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG MEAL (PLUS PLAN) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { $set: updateQuery },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER INTAKE ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// // ==========================================
// // --- 🌟 NEW: PATIENT LOG SINGLE PRODUCT ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;
//         // amount will be the grams (e.g., 100)

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         // 1. Create a dynamic "Quick Log" Recipe out of this single product
//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         // 2. Assign this newly created recipe to the patient's daily plan
//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { $set: updateQuery },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({
//                 path: 'recommended_meals.breakfast',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.lunch',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.dinner',
//                 populate: { path: 'ingredients.product' }
//             })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         // 🌟 REVISED MIDNIGHT RESET LOGIC 🌟
//         const todayStr = new Date().toDateString();

//         if (patient.last_reset_date !== todayStr) {

//             // 1. Prepare data that resets for EVERYONE (Water & Date)
//             const resetData = {
//                 "waterIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             // 2. ONLY reset meals if the user is Free or Plus
//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = null;
//                 resetData["recommended_meals.lunch"] = null;
//                 resetData["recommended_meals.dinner"] = null;

//                 // Clear locally so the dashboard reads 0 instantly
//                 patient.recommended_meals = { breakfast: null, lunch: null, dinner: null };
//             }

//             // 3. Save the specific resets to the database
//             await Patient.findByIdAndUpdate(patient._id, {
//                 $set: resetData
//             }, { strict: false });

//             // Clear water locally so the dashboard reads 0 instantly
//             patient.waterIntake = 0;
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (meal) => {
//             if (!meal || !meal.ingredients) return;

//             meal.ingredients.forEach(item => {
//                 const prod = item.product;
//                 if (prod) {
//                     const amountString = item.amount || "100";
//                     const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                     const multiplier = numericAmount / 100;

//                     consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                     consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                     consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                     consumedFat += (prod['Fat'] || 0) * multiplier;
//                     consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                 }
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- 🌟 PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         // 🌟 CHANGED: Using $push so it ADDS to the array instead of overwriting!
//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             // Safety Fallback: If the database field is still a string from yesterday, force it into an array
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- 🌟 PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         // 🌟 CHANGED: Using $push to add product to array
//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER INTAKE ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({
//                 path: 'recommended_meals.breakfast',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.lunch',
//                 populate: { path: 'ingredients.product' }
//             })
//             .populate({
//                 path: 'recommended_meals.dinner',
//                 populate: { path: 'ingredients.product' }
//             })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         if (patient.last_reset_date !== todayStr) {
//             const resetData = {
//                 "waterIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 // 🌟 SET TO EMPTY ARRAYS INSTEAD OF NULL
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];

//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [] };
//             }

//             await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });
//             patient.waterIntake = 0;
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         // 🌟 SMART ARRAY LOGIC 🌟
//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             // If it's an array (which it is now), use it. If old database data, wrap it in array!
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- 🌟 PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- 🌟 PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER INTAKE ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } }) // 🌟 FETCH SNACKS
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         if (patient.last_reset_date !== todayStr) {
//             const resetData = {
//                 "waterIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = []; // 🌟 RESET SNACKS

//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });
//             patient.waterIntake = 0;
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks); // 🌟 ADD SNACKS TO MATH
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });





// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- 🌟 PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- 🌟 PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER INTAKE ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// // ==========================================
// // --- 🌟 NEW: UPDATE STEPS ROUTE 🌟 ---
// // ==========================================
// app.put('/patient/:id/steps', async (req, res) => {
//     try {
//         const { stepIntake } = req.body;
//         console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

//         // Save today's steps directly to the database
//         await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

//         res.json({ message: "Steps saved to database!" });
//     } catch (error) {
//         console.error("Error saving steps:", error);
//         res.status(500).json({ message: "Error updating steps." });
//     }
// });

// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "MIDNIGHT RESET" LOGIC (NOW INCLUDES STEPS!)
//         if (patient.last_reset_date !== todayStr) {
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0, // 🌟 Reset steps to 0
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = [];

//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });
//             patient.waterIntake = 0;
//             patient.stepIntake = 0; // Local clear
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0,
//             stepIntake: patient.stepIntake || 0 // 🌟 SEND SAVED STEPS TO FRONTEND
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });







// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         console.log("\n--- NEW SEARCH REQUEST ---");
//         console.log("1. Data received from Mobile App:", req.query);

//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         console.log("2. MongoDB Query built:", JSON.stringify(query));
//         const results = await Product.find(query).limit(20);
//         console.log(`3. Found ${results.length} products!`);

//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         console.log("Signup Request Received. Body:", req.body);

//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER AND STEPS ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// app.put('/patient/:id/steps', async (req, res) => {
//     try {
//         const { stepIntake } = req.body;
//         console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

//         await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

//         res.json({ message: "Steps saved to database!" });
//     } catch (error) {
//         console.error("Error saving steps:", error);
//         res.status(500).json({ message: "Error updating steps." });
//     }
// });


// // ==========================================
// // --- 🛒 NEW: AUTO-GENERATE GROCERY LIST ---
// // ==========================================
// app.get('/patient/:id/grocery', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let dailyTotalCost = 0;

//         const processMeals = (mealData) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();

//                         // Parse pure numbers from string (e.g. "250g" -> 250)
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         // Multiply base price by weight multiplier
//                         const price = parseFloat(prod.Price || 0) * multiplier;

//                         // Merge identical ingredients to calculate total weight and price
//                         if (!groceryMap[prodId]) {
//                             groceryMap[prodId] = {
//                                 id: prodId,
//                                 name: prod['Product Name'] || prod.Brand || 'Unknown Product',
//                                 unit: 'g', // Standardized for rendering
//                                 amount: 0,
//                                 cost: 0
//                             };
//                         }

//                         groceryMap[prodId].amount += numericAmount;
//                         groceryMap[prodId].cost += price;
//                         dailyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         if (patient.recommended_meals) {
//             processMeals(patient.recommended_meals.breakfast);
//             processMeals(patient.recommended_meals.lunch);
//             processMeals(patient.recommended_meals.dinner);
//             processMeals(patient.recommended_meals.snacks);
//         }

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: (dailyTotalCost * 7).toFixed(2),
//             items: groceryList
//         });

//     } catch (error) {
//         console.error("Grocery Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching grocery list", error });
//     }
// });


// // ==========================================
// // --- REAL PATIENT DASHBOARD ROUTE ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         if (patient.last_reset_date !== todayStr) {
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = [];

//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });
//             patient.waterIntake = 0;
//             patient.stepIntake = 0;
//         }

//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0,
//             stepIntake: patient.stepIntake || 0
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });










// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         const results = await Product.find(query).limit(20);
//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER AND STEPS ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// app.put('/patient/:id/steps', async (req, res) => {
//     try {
//         const { stepIntake } = req.body;
//         console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

//         await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

//         res.json({ message: "Steps saved to database!" });
//     } catch (error) {
//         console.error("Error saving steps:", error);
//         res.status(500).json({ message: "Error updating steps." });
//     }
// });

// // ==========================================
// // --- 🛒 AUTO-GENERATE GROCERY LIST ---
// // ==========================================
// app.get('/patient/:id/grocery', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let dailyTotalCost = 0;

//         const processMeals = (mealData) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();

//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;
//                         const price = parseFloat(prod.Price || 0) * multiplier;

//                         if (!groceryMap[prodId]) {
//                             groceryMap[prodId] = {
//                                 id: prodId,
//                                 name: prod['Product Name'] || prod.Brand || 'Unknown Product',
//                                 unit: 'g',
//                                 amount: 0,
//                                 cost: 0
//                             };
//                         }

//                         groceryMap[prodId].amount += numericAmount;
//                         groceryMap[prodId].cost += price;
//                         dailyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         if (patient.recommended_meals) {
//             processMeals(patient.recommended_meals.breakfast);
//             processMeals(patient.recommended_meals.lunch);
//             processMeals(patient.recommended_meals.dinner);
//             processMeals(patient.recommended_meals.snacks);
//         }

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: (dailyTotalCost * 7).toFixed(2),
//             items: groceryList
//         });

//     } catch (error) {
//         console.error("Grocery Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching grocery list", error });
//     }
// });

// // ==========================================
// // --- 🌟 REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" LOGIC
//         if (patient.last_reset_date && patient.last_reset_date !== todayStr) {

//             // 1. Calculate Yesterday's Macros before deleting them
//             let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//             const calcPastMeals = (mealData) => {
//                 if (!mealData) return;
//                 const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                 recipes.forEach(recipe => {
//                     if (!recipe || !recipe.ingredients) return;
//                     recipe.ingredients.forEach(item => {
//                         const prod = item.product;
//                         if (prod) {
//                             const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                             const multiplier = numericAmount / 100;
//                             pastKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                             pastPro += (prod['Proteins'] || 0) * multiplier;
//                             pastCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                             pastFat += (prod['Fat'] || 0) * multiplier;
//                         }
//                     });
//                 });
//             };

//             if (patient.recommended_meals) {
//                 calcPastMeals(patient.recommended_meals.breakfast);
//                 calcPastMeals(patient.recommended_meals.lunch);
//                 calcPastMeals(patient.recommended_meals.dinner);
//                 calcPastMeals(patient.recommended_meals.snacks);
//             }

//             // 2. Package the Snapshot
//             const snapshot = {
//                 date: patient.last_reset_date,
//                 kcal: Math.round(pastKcal),
//                 protein: Math.round(pastPro),
//                 carbs: Math.round(pastCarbs),
//                 fat: Math.round(pastFat)
//             };

//             // 3. Define reset variables
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = [];
//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             // 4. Save Snapshot AND Reset Data in one powerful database call
//             await Patient.findByIdAndUpdate(patient._id, {
//                 $set: resetData,
//                 $push: { historical_logs: snapshot } // 🌟 Saved to the vault!
//             }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;

//             // Push it to the active memory so it loads instantly right now
//             if (!patient.historical_logs) patient.historical_logs = [];
//             patient.historical_logs.push(snapshot);

//         } else if (!patient.last_reset_date) {
//             // First time opening the app, initialize the date
//             await Patient.findByIdAndUpdate(patient._id, { $set: { last_reset_date: todayStr } }, { strict: false });
//         }

//         // --- CALCULATE TODAY'S MACROS ---
//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];
//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;
//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0,
//             stepIntake: patient.stepIntake || 0,

//             // 🌟 FINALLY, SEND THE VAULT DATA TO THE FRONTEND
//             historical_logs: patient.historical_logs || []
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });










// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         const results = await Product.find(query).limit(20);
//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- 🌟 PATIENT PROFILE UPDATE (NEW) ---
// // ==========================================
// app.put('/patient/:id/profile', async (req, res) => {
//     try {
//         console.log(`[PROFILE] Request to update ${req.params.id}:`, req.body);
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const { name, age, weight, height } = req.body;

//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);

//         // 🌟 Weight Tracking Logic: If weight changed, log it in history for the chart slope
//         if (weight && Number(weight) !== patient.weight) {
//             patient.weight = Number(weight);
//             patient.weight_history.push({ day: new Date(), weight: Number(weight) });
//             console.log(`[PROFILE] Added new weight entry for chart: ${weight}kg`);
//         }

//         await patient.save();

//         res.json({ message: "Profile updated!", weight: patient.weight, age: patient.age, height: patient.height, name: patient.name });
//     } catch (error) {
//         console.error("Profile Edit Error:", error);
//         res.status(500).json({ message: "Server error updating profile." });
//     }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER AND STEPS ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// app.put('/patient/:id/steps', async (req, res) => {
//     try {
//         const { stepIntake } = req.body;
//         console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

//         await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

//         res.json({ message: "Steps saved to database!" });
//     } catch (error) {
//         console.error("Error saving steps:", error);
//         res.status(500).json({ message: "Error updating steps." });
//     }
// });

// // ==========================================
// // --- 🛒 AUTO-GENERATE GROCERY LIST ---
// // ==========================================
// app.get('/patient/:id/grocery', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let dailyTotalCost = 0;

//         const processMeals = (mealData) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();

//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;
//                         const price = parseFloat(prod.Price || 0) * multiplier;

//                         if (!groceryMap[prodId]) {
//                             groceryMap[prodId] = {
//                                 id: prodId,
//                                 name: prod['Product Name'] || prod.Brand || 'Unknown Product',
//                                 unit: 'g',
//                                 amount: 0,
//                                 cost: 0
//                             };
//                         }

//                         groceryMap[prodId].amount += numericAmount;
//                         groceryMap[prodId].cost += price;
//                         dailyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         if (patient.recommended_meals) {
//             processMeals(patient.recommended_meals.breakfast);
//             processMeals(patient.recommended_meals.lunch);
//             processMeals(patient.recommended_meals.dinner);
//             processMeals(patient.recommended_meals.snacks);
//         }

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: (dailyTotalCost * 7).toFixed(2),
//             items: groceryList
//         });

//     } catch (error) {
//         console.error("Grocery Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching grocery list", error });
//     }
// });

// // ==========================================
// // --- 🌟 REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" LOGIC
//         if (patient.last_reset_date && patient.last_reset_date !== todayStr) {

//             // 1. Calculate Yesterday's Macros before deleting them
//             let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//             const calcPastMeals = (mealData) => {
//                 if (!mealData) return;
//                 const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                 recipes.forEach(recipe => {
//                     if (!recipe || !recipe.ingredients) return;
//                     recipe.ingredients.forEach(item => {
//                         const prod = item.product;
//                         if (prod) {
//                             const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                             const multiplier = numericAmount / 100;
//                             pastKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                             pastPro += (prod['Proteins'] || 0) * multiplier;
//                             pastCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                             pastFat += (prod['Fat'] || 0) * multiplier;
//                         }
//                     });
//                 });
//             };

//             if (patient.recommended_meals) {
//                 calcPastMeals(patient.recommended_meals.breakfast);
//                 calcPastMeals(patient.recommended_meals.lunch);
//                 calcPastMeals(patient.recommended_meals.dinner);
//                 calcPastMeals(patient.recommended_meals.snacks);
//             }

//             // 2. Package the Snapshot
//             const snapshot = {
//                 date: patient.last_reset_date,
//                 kcal: Math.round(pastKcal),
//                 protein: Math.round(pastPro),
//                 carbs: Math.round(pastCarbs),
//                 fat: Math.round(pastFat)
//             };

//             // 3. Define reset variables
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = [];
//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             // 4. Save Snapshot AND Reset Data in one powerful database call
//             await Patient.findByIdAndUpdate(patient._id, {
//                 $set: resetData,
//                 $push: { historical_logs: snapshot }
//             }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;

//             if (!patient.historical_logs) patient.historical_logs = [];
//             patient.historical_logs.push(snapshot);

//         } else if (!patient.last_reset_date) {
//             await Patient.findByIdAndUpdate(patient._id, { $set: { last_reset_date: todayStr } }, { strict: false });
//         }

//         // --- CALCULATE TODAY'S MACROS ---
//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0,
//             stepIntake: patient.stepIntake || 0,

//             historical_logs: patient.historical_logs || []
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });









// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// mongoose.connect('mongodb://127.0.0.1:27017/myApp')
//     .then(() => console.log("✅ Successfully linked to MongoDB!"))
//     .catch(err => console.error("❌ MongoDB connection error:", err));

// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         const results = await Product.find(query).limit(20);
//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- 🤝 NEW: CLIENT-COACH PAIRING ROUTES ---
// // ==========================================

// // 1. Patient hires an Expert
// app.put('/patient/:id/assign-expert', async (req, res) => {
//     try {
//         const { expertId } = req.body;
//         const patientId = req.params.id;

//         // Link Expert to Patient
//         const patient = await Patient.findByIdAndUpdate(patientId, { assigned_expert: expertId }, { new: true });

//         // Add Patient to Expert's Roster (using $addToSet prevents duplicates if clicked twice)
//         await Expert.findByIdAndUpdate(expertId, { $addToSet: { supervised_patients: patientId } });

//         res.json({ message: "Expert successfully assigned!", patient });
//     } catch (error) {
//         res.status(500).json({ message: "Error assigning expert", error });
//     }
// });

// // 2. Privacy Lock: Expert fetches ONLY their own patients
// app.get('/expert/:id/mypatients', async (req, res) => {
//     try {
//         const expertId = req.params.id;

//         // Search the Patient collection ONLY for patients assigned to this specific expert
//         const myPatients = await Patient.find({ assigned_expert: expertId }).select('-password');

//         res.json(myPatients);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching your patients", error });
//     }
// });

// // 3. Remove/Fire an Expert
// app.put('/expert/:expertId/remove-patient/:patientId', async (req, res) => {
//     try {
//         // Break the handshake on both sides
//         await Patient.findByIdAndUpdate(req.params.patientId, { assigned_expert: null });
//         await Expert.findByIdAndUpdate(req.params.expertId, { $pull: { supervised_patients: req.params.patientId } });

//         res.json({ message: "Patient successfully removed from roster." });
//     } catch (error) {
//         res.status(500).json({ message: "Error removing patient", error });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- 🌟 PATIENT PROFILE UPDATE ---
// // ==========================================
// app.put('/patient/:id/profile', async (req, res) => {
//     try {
//         console.log(`[PROFILE] Request to update ${req.params.id}:`, req.body);
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const { name, age, weight, height } = req.body;

//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);

//         // 🌟 Weight Tracking Logic: If weight changed, log it in history for the chart slope
//         if (weight && Number(weight) !== patient.weight) {
//             patient.weight = Number(weight);
//             patient.weight_history.push({ day: new Date(), weight: Number(weight) });
//             console.log(`[PROFILE] Added new weight entry for chart: ${weight}kg`);
//         }

//         await patient.save();

//         res.json({ message: "Profile updated!", weight: patient.weight, age: patient.age, height: patient.height, name: patient.name });
//     } catch (error) {
//         console.error("Profile Edit Error:", error);
//         res.status(500).json({ message: "Server error updating profile." });
//     }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER AND STEPS ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// app.put('/patient/:id/steps', async (req, res) => {
//     try {
//         const { stepIntake } = req.body;
//         console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

//         await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

//         res.json({ message: "Steps saved to database!" });
//     } catch (error) {
//         console.error("Error saving steps:", error);
//         res.status(500).json({ message: "Error updating steps." });
//     }
// });

// // ==========================================
// // --- 🛒 AUTO-GENERATE GROCERY LIST ---
// // ==========================================
// app.get('/patient/:id/grocery', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let dailyTotalCost = 0;

//         const processMeals = (mealData) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();

//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;
//                         const price = parseFloat(prod.Price || 0) * multiplier;

//                         if (!groceryMap[prodId]) {
//                             groceryMap[prodId] = {
//                                 id: prodId,
//                                 name: prod['Product Name'] || prod.Brand || 'Unknown Product',
//                                 unit: 'g',
//                                 amount: 0,
//                                 cost: 0
//                             };
//                         }

//                         groceryMap[prodId].amount += numericAmount;
//                         groceryMap[prodId].cost += price;
//                         dailyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         if (patient.recommended_meals) {
//             processMeals(patient.recommended_meals.breakfast);
//             processMeals(patient.recommended_meals.lunch);
//             processMeals(patient.recommended_meals.dinner);
//             processMeals(patient.recommended_meals.snacks);
//         }

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: (dailyTotalCost * 7).toFixed(2),
//             items: groceryList
//         });

//     } catch (error) {
//         console.error("Grocery Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching grocery list", error });
//     }
// });

// // ==========================================
// // --- 🌟 REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" LOGIC
//         if (patient.last_reset_date && patient.last_reset_date !== todayStr) {

//             // 1. Calculate Yesterday's Macros before deleting them
//             let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//             const calcPastMeals = (mealData) => {
//                 if (!mealData) return;
//                 const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                 recipes.forEach(recipe => {
//                     if (!recipe || !recipe.ingredients) return;
//                     recipe.ingredients.forEach(item => {
//                         const prod = item.product;
//                         if (prod) {
//                             const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                             const multiplier = numericAmount / 100;
//                             pastKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                             pastPro += (prod['Proteins'] || 0) * multiplier;
//                             pastCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                             pastFat += (prod['Fat'] || 0) * multiplier;
//                         }
//                     });
//                 });
//             };

//             if (patient.recommended_meals) {
//                 calcPastMeals(patient.recommended_meals.breakfast);
//                 calcPastMeals(patient.recommended_meals.lunch);
//                 calcPastMeals(patient.recommended_meals.dinner);
//                 calcPastMeals(patient.recommended_meals.snacks);
//             }

//             // 2. Package the Snapshot
//             const snapshot = {
//                 date: patient.last_reset_date,
//                 kcal: Math.round(pastKcal),
//                 protein: Math.round(pastPro),
//                 carbs: Math.round(pastCarbs),
//                 fat: Math.round(pastFat)
//             };

//             // 3. Define reset variables
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = [];
//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             // 4. Save Snapshot AND Reset Data in one powerful database call
//             await Patient.findByIdAndUpdate(patient._id, {
//                 $set: resetData,
//                 $push: { historical_logs: snapshot }
//             }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;

//             if (!patient.historical_logs) patient.historical_logs = [];
//             patient.historical_logs.push(snapshot);

//         } else if (!patient.last_reset_date) {
//             await Patient.findByIdAndUpdate(patient._id, { $set: { last_reset_date: todayStr } }, { strict: false });
//         }

//         // --- CALCULATE TODAY'S MACROS ---
//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0,
//             stepIntake: patient.stepIntake || 0,

//             historical_logs: patient.historical_logs || [],
//             assigned_expert: patient.assigned_expert || null // 🌟 Send assigned expert info to frontend
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });









// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// // mongoose.connect('mongodb://127.0.0.1:27017/myApp')
// //     .then(() => console.log("✅ Successfully linked to MongoDB!"))
// //     .catch(err => console.error("❌ MongoDB connection error:", err));

// const dbURI = 'mongodb://taki_db_user:taki2026db@ac-zh59ffq-shard-00-00.j8rp9f4.mongodb.net:27017,ac-zh59ffq-shard-00-01.j8rp9f4.mongodb.net:27017,ac-zh59ffq-shard-00-02.j8rp9f4.mongodb.net:27017/myApp?ssl=true&replicaSet=atlas-di6vmn-shard-0&authSource=admin&appName=Cluster0';

// mongoose.connect(dbURI)
//     .then(() => console.log("✅ Successfully linked to MongoDB Cloud! ☁️"))
//     .catch(err => console.error("❌ MongoDB connection error:", err.message));


// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         const results = await Product.find(query).limit(20);
//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- 🤝 NEW: ADVANCED MARKETPLACE ROUTES ---
// // ==========================================

// // 1. Patient REQUESTS an Expert (Instead of forcing)
// app.put('/patient/:id/request-expert', async (req, res) => {
//     try {
//         const { expertId } = req.body;
//         const patientId = req.params.id;

//         // Check Capacity Limit First
//         const expert = await Expert.findById(expertId);
//         if (!expert) return res.status(404).json({ message: "Expert not found" });

//         if (expert.supervised_patients.length >= expert.max_clients) {
//             return res.status(400).json({ message: "This expert is fully booked and cannot accept new clients." });
//         }

//         // Set Patient to "Pending"
//         await Patient.findByIdAndUpdate(patientId, { pending_expert: expertId });

//         // Put Patient in Expert's "Waiting Room"
//         await Expert.findByIdAndUpdate(expertId, { $addToSet: { pending_requests: patientId } });

//         res.json({ message: "Request sent successfully to the expert!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error sending request", error });
//     }
// });

// // 2. Expert ACCEPTS the Request
// app.put('/expert/:expertId/accept-request/:patientId', async (req, res) => {
//     try {
//         const { expertId, patientId } = req.params;

//         // Verify capacity one last time to be safe
//         const expert = await Expert.findById(expertId);
//         if (expert.supervised_patients.length >= expert.max_clients) {
//             return res.status(400).json({ message: "You have reached your maximum client capacity." });
//         }

//         // Upgrade Patient: Move from Pending to Assigned
//         await Patient.findByIdAndUpdate(patientId, { assigned_expert: expertId, pending_expert: null });

//         // Upgrade Expert: Move Patient from Waiting Room to Active Roster
//         await Expert.findByIdAndUpdate(expertId, {
//             $pull: { pending_requests: patientId },
//             $addToSet: { supervised_patients: patientId }
//         });

//         res.json({ message: "Patient accepted into your roster!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error accepting patient", error });
//     }
// });

// // 3. Expert DECLINES the Request
// app.put('/expert/:expertId/decline-request/:patientId', async (req, res) => {
//     try {
//         const { expertId, patientId } = req.params;

//         // Clear the pending status on both sides
//         await Patient.findByIdAndUpdate(patientId, { pending_expert: null });
//         await Expert.findByIdAndUpdate(expertId, { $pull: { pending_requests: patientId } });

//         res.json({ message: "Patient request declined." });
//     } catch (error) {
//         res.status(500).json({ message: "Error declining patient", error });
//     }
// });

// // 4. Expert fetches Active Roster AND Pending Requests
// app.get('/expert/:id/mypatients', async (req, res) => {
//     try {
//         const expertId = req.params.id;

//         // Fetch Active Patients
//         const activePatients = await Patient.find({ assigned_expert: expertId }).select('-password');
//         // Fetch Pending Patients
//         const pendingPatients = await Patient.find({ pending_expert: expertId }).select('-password');

//         res.json({
//             active: activePatients,
//             pending: pendingPatients
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching patients", error });
//     }
// });

// // 5. Remove/Fire an Expert (Kept for safety)
// app.put('/expert/:expertId/remove-patient/:patientId', async (req, res) => {
//     try {
//         await Patient.findByIdAndUpdate(req.params.patientId, { assigned_expert: null, pending_expert: null });
//         await Expert.findByIdAndUpdate(req.params.expertId, { $pull: { supervised_patients: req.params.patientId } });
//         res.json({ message: "Patient successfully removed from roster." });
//     } catch (error) {
//         res.status(500).json({ message: "Error removing patient", error });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         const recipes = await Recipe.find().populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- 🌟 PATIENT PROFILE UPDATE ---
// // ==========================================
// app.put('/patient/:id/profile', async (req, res) => {
//     try {
//         console.log(`[PROFILE] Request to update ${req.params.id}:`, req.body);
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const { name, age, weight, height } = req.body;

//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);

//         // 🌟 Weight Tracking Logic: If weight changed, log it in history for the chart slope
//         if (weight && Number(weight) !== patient.weight) {
//             patient.weight = Number(weight);
//             patient.weight_history.push({ day: new Date(), weight: Number(weight) });
//             console.log(`[PROFILE] Added new weight entry for chart: ${weight}kg`);
//         }

//         await patient.save();

//         res.json({ message: "Profile updated!", weight: patient.weight, age: patient.age, height: patient.height, name: patient.name });
//     } catch (error) {
//         console.error("Profile Edit Error:", error);
//         res.status(500).json({ message: "Server error updating profile." });
//     }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER AND STEPS ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// app.put('/patient/:id/steps', async (req, res) => {
//     try {
//         const { stepIntake } = req.body;
//         console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

//         await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

//         res.json({ message: "Steps saved to database!" });
//     } catch (error) {
//         console.error("Error saving steps:", error);
//         res.status(500).json({ message: "Error updating steps." });
//     }
// });

// // ==========================================
// // --- 🛒 AUTO-GENERATE GROCERY LIST ---
// // ==========================================
// app.get('/patient/:id/grocery', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let dailyTotalCost = 0;

//         const processMeals = (mealData) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();

//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;
//                         const price = parseFloat(prod.Price || 0) * multiplier;

//                         if (!groceryMap[prodId]) {
//                             groceryMap[prodId] = {
//                                 id: prodId,
//                                 name: prod['Product Name'] || prod.Brand || 'Unknown Product',
//                                 unit: 'g',
//                                 amount: 0,
//                                 cost: 0
//                             };
//                         }

//                         groceryMap[prodId].amount += numericAmount;
//                         groceryMap[prodId].cost += price;
//                         dailyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         if (patient.recommended_meals) {
//             processMeals(patient.recommended_meals.breakfast);
//             processMeals(patient.recommended_meals.lunch);
//             processMeals(patient.recommended_meals.dinner);
//             processMeals(patient.recommended_meals.snacks);
//         }

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: (dailyTotalCost * 7).toFixed(2),
//             items: groceryList
//         });

//     } catch (error) {
//         console.error("Grocery Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching grocery list", error });
//     }
// });

// // ==========================================
// // --- 🌟 REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" LOGIC
//         if (patient.last_reset_date && patient.last_reset_date !== todayStr) {

//             // 1. Calculate Yesterday's Macros before deleting them
//             let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//             const calcPastMeals = (mealData) => {
//                 if (!mealData) return;
//                 const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                 recipes.forEach(recipe => {
//                     if (!recipe || !recipe.ingredients) return;
//                     recipe.ingredients.forEach(item => {
//                         const prod = item.product;
//                         if (prod) {
//                             const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                             const multiplier = numericAmount / 100;
//                             pastKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                             pastPro += (prod['Proteins'] || 0) * multiplier;
//                             pastCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                             pastFat += (prod['Fat'] || 0) * multiplier;
//                         }
//                     });
//                 });
//             };

//             if (patient.recommended_meals) {
//                 calcPastMeals(patient.recommended_meals.breakfast);
//                 calcPastMeals(patient.recommended_meals.lunch);
//                 calcPastMeals(patient.recommended_meals.dinner);
//                 calcPastMeals(patient.recommended_meals.snacks);
//             }

//             // 2. Package the Snapshot
//             const snapshot = {
//                 date: patient.last_reset_date,
//                 kcal: Math.round(pastKcal),
//                 protein: Math.round(pastPro),
//                 carbs: Math.round(pastCarbs),
//                 fat: Math.round(pastFat)
//             };

//             // 3. Define reset variables
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = [];
//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             // 4. Save Snapshot AND Reset Data in one powerful database call
//             await Patient.findByIdAndUpdate(patient._id, {
//                 $set: resetData,
//                 $push: { historical_logs: snapshot }
//             }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;

//             if (!patient.historical_logs) patient.historical_logs = [];
//             patient.historical_logs.push(snapshot);

//         } else if (!patient.last_reset_date) {
//             await Patient.findByIdAndUpdate(patient._id, { $set: { last_reset_date: todayStr } }, { strict: false });
//         }

//         // --- CALCULATE TODAY'S MACROS ---
//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0,
//             stepIntake: patient.stepIntake || 0,

//             historical_logs: patient.historical_logs || [],
//             assigned_expert: patient.assigned_expert || null,

//             // 🌟 Send pending status to frontend too
//             pending_expert: patient.pending_expert || null
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });







// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// const dbURI = 'mongodb://taki_db_user:taki2026db@ac-zh59ffq-shard-00-00.j8rp9f4.mongodb.net:27017,ac-zh59ffq-shard-00-01.j8rp9f4.mongodb.net:27017,ac-zh59ffq-shard-00-02.j8rp9f4.mongodb.net:27017/myApp?ssl=true&replicaSet=atlas-di6vmn-shard-0&authSource=admin&appName=Cluster0';

// mongoose.connect(dbURI)
//     .then(() => console.log("✅ Successfully linked to MongoDB Cloud! ☁️"))
//     .catch(err => console.error("❌ MongoDB connection error:", err.message));


// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         const results = await Product.find(query).limit(20);
//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- 🤝 NEW: ADVANCED MARKETPLACE ROUTES ---
// // ==========================================

// // 1. Patient REQUESTS an Expert (Instead of forcing)
// app.put('/patient/:id/request-expert', async (req, res) => {
//     try {
//         const { expertId } = req.body;
//         const patientId = req.params.id;

//         // Check Capacity Limit First
//         const expert = await Expert.findById(expertId);
//         if (!expert) return res.status(404).json({ message: "Expert not found" });

//         if (expert.supervised_patients.length >= expert.max_clients) {
//             return res.status(400).json({ message: "This expert is fully booked and cannot accept new clients." });
//         }

//         // Set Patient to "Pending"
//         await Patient.findByIdAndUpdate(patientId, { pending_expert: expertId });

//         // Put Patient in Expert's "Waiting Room"
//         await Expert.findByIdAndUpdate(expertId, { $addToSet: { pending_requests: patientId } });

//         res.json({ message: "Request sent successfully to the expert!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error sending request", error });
//     }
// });

// // 2. Expert ACCEPTS the Request
// app.put('/expert/:expertId/accept-request/:patientId', async (req, res) => {
//     try {
//         const { expertId, patientId } = req.params;

//         // Verify capacity one last time to be safe
//         const expert = await Expert.findById(expertId);
//         if (expert.supervised_patients.length >= expert.max_clients) {
//             return res.status(400).json({ message: "You have reached your maximum client capacity." });
//         }

//         // Upgrade Patient: Move from Pending to Assigned
//         await Patient.findByIdAndUpdate(patientId, { assigned_expert: expertId, pending_expert: null });

//         // Upgrade Expert: Move Patient from Waiting Room to Active Roster
//         await Expert.findByIdAndUpdate(expertId, {
//             $pull: { pending_requests: patientId },
//             $addToSet: { supervised_patients: patientId }
//         });

//         res.json({ message: "Patient accepted into your roster!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error accepting patient", error });
//     }
// });

// // 3. Expert DECLINES the Request
// app.put('/expert/:expertId/decline-request/:patientId', async (req, res) => {
//     try {
//         const { expertId, patientId } = req.params;

//         // Clear the pending status on both sides
//         await Patient.findByIdAndUpdate(patientId, { pending_expert: null });
//         await Expert.findByIdAndUpdate(expertId, { $pull: { pending_requests: patientId } });

//         res.json({ message: "Patient request declined." });
//     } catch (error) {
//         res.status(500).json({ message: "Error declining patient", error });
//     }
// });

// // 4. Expert fetches Active Roster AND Pending Requests
// app.get('/expert/:id/mypatients', async (req, res) => {
//     try {
//         const expertId = req.params.id;

//         // Fetch Active Patients
//         const activePatients = await Patient.find({ assigned_expert: expertId }).select('-password');
//         // Fetch Pending Patients
//         const pendingPatients = await Patient.find({ pending_expert: expertId }).select('-password');

//         res.json({
//             active: activePatients,
//             pending: pendingPatients
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching patients", error });
//     }
// });

// // 5. Remove/Fire an Expert (Kept for safety)
// app.put('/expert/:expertId/remove-patient/:patientId', async (req, res) => {
//     try {
//         await Patient.findByIdAndUpdate(req.params.patientId, { assigned_expert: null, pending_expert: null });
//         await Expert.findByIdAndUpdate(req.params.expertId, { $pull: { supervised_patients: req.params.patientId } });
//         res.json({ message: "Patient successfully removed from roster." });
//     } catch (error) {
//         res.status(500).json({ message: "Error removing patient", error });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });

//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // 🌟 UPDATED: RECIPE ROUTE WITH CATEGORY FILTERING 🌟
// app.get('/recipes', async (req, res) => {
//     try {
//         let query = {};
//         // If the mobile app sends a category query, filter by it!
//         if (req.query.category) {
//             query.category = req.query.category;
//         }

//         const recipes = await Recipe.find(query).populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- 🌟 PATIENT PROFILE UPDATE ---
// // ==========================================
// app.put('/patient/:id/profile', async (req, res) => {
//     try {
//         console.log(`[PROFILE] Request to update ${req.params.id}:`, req.body);
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         // 🌟 Added gender and activity to destructured body
//         const { name, age, weight, height, gender, activity } = req.body;

//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);
//         if (gender) patient.gender = gender;
//         if (activity) patient.activity = activity;

//         // 🌟 Weight Tracking Logic: If weight changed, log it in history for the chart slope
//         if (weight && Number(weight) !== patient.weight) {
//             patient.weight = Number(weight);
//             patient.weight_history.push({ day: new Date(), weight: Number(weight) });
//             console.log(`[PROFILE] Added new weight entry for chart: ${weight}kg`);
//         }

//         await patient.save();

//         res.json({
//             message: "Profile updated!",
//             weight: patient.weight,
//             age: patient.age,
//             height: patient.height,
//             name: patient.name,
//             gender: patient.gender,
//             activity: patient.activity
//         });
//     } catch (error) {
//         console.error("Profile Edit Error:", error);
//         res.status(500).json({ message: "Server error updating profile." });
//     }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER AND STEPS ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// app.put('/patient/:id/steps', async (req, res) => {
//     try {
//         const { stepIntake } = req.body;
//         console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

//         await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

//         res.json({ message: "Steps saved to database!" });
//     } catch (error) {
//         console.error("Error saving steps:", error);
//         res.status(500).json({ message: "Error updating steps." });
//     }
// });

// // ==========================================
// // --- 🛒 AUTO-GENERATE GROCERY LIST ---
// // ==========================================
// app.get('/patient/:id/grocery', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let dailyTotalCost = 0;

//         const processMeals = (mealData) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();

//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;
//                         const price = parseFloat(prod.Price || 0) * multiplier;

//                         if (!groceryMap[prodId]) {
//                             groceryMap[prodId] = {
//                                 id: prodId,
//                                 name: prod['Product Name'] || prod.Brand || 'Unknown Product',
//                                 unit: 'g',
//                                 amount: 0,
//                                 cost: 0
//                             };
//                         }

//                         groceryMap[prodId].amount += numericAmount;
//                         groceryMap[prodId].cost += price;
//                         dailyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         if (patient.recommended_meals) {
//             processMeals(patient.recommended_meals.breakfast);
//             processMeals(patient.recommended_meals.lunch);
//             processMeals(patient.recommended_meals.dinner);
//             processMeals(patient.recommended_meals.snacks);
//         }

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: (dailyTotalCost * 7).toFixed(2),
//             items: groceryList
//         });

//     } catch (error) {
//         console.error("Grocery Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching grocery list", error });
//     }
// });

// // ==========================================
// // --- 🌟 REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" LOGIC
//         if (patient.last_reset_date && patient.last_reset_date !== todayStr) {

//             // 1. Calculate Yesterday's Macros before deleting them
//             let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//             const calcPastMeals = (mealData) => {
//                 if (!mealData) return;
//                 const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                 recipes.forEach(recipe => {
//                     if (!recipe || !recipe.ingredients) return;
//                     recipe.ingredients.forEach(item => {
//                         const prod = item.product;
//                         if (prod) {
//                             const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                             const multiplier = numericAmount / 100;
//                             pastKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                             pastPro += (prod['Proteins'] || 0) * multiplier;
//                             pastCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                             pastFat += (prod['Fat'] || 0) * multiplier;
//                         }
//                     });
//                 });
//             };

//             if (patient.recommended_meals) {
//                 calcPastMeals(patient.recommended_meals.breakfast);
//                 calcPastMeals(patient.recommended_meals.lunch);
//                 calcPastMeals(patient.recommended_meals.dinner);
//                 calcPastMeals(patient.recommended_meals.snacks);
//             }

//             // 2. Package the Snapshot
//             const snapshot = {
//                 date: patient.last_reset_date,
//                 kcal: Math.round(pastKcal),
//                 protein: Math.round(pastPro),
//                 carbs: Math.round(pastCarbs),
//                 fat: Math.round(pastFat)
//             };

//             // 3. Define reset variables
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = [];
//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             // 4. Save Snapshot AND Reset Data in one powerful database call
//             await Patient.findByIdAndUpdate(patient._id, {
//                 $set: resetData,
//                 $push: { historical_logs: snapshot }
//             }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;

//             if (!patient.historical_logs) patient.historical_logs = [];
//             patient.historical_logs.push(snapshot);

//         } else if (!patient.last_reset_date) {
//             await Patient.findByIdAndUpdate(patient._id, { $set: { last_reset_date: todayStr } }, { strict: false });
//         }

//         // --- CALCULATE TODAY'S MACROS ---
//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += (prod['Energy-Kcal'] || 0) * multiplier;
//                         consumedProtein += (prod['Proteins'] || 0) * multiplier;
//                         consumedCarbs += (prod['Carbohydrates'] || 0) * multiplier;
//                         consumedFat += (prod['Fat'] || 0) * multiplier;
//                         consumedFiber += (prod['Fiber'] || 0) * multiplier;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0,
//             stepIntake: patient.stepIntake || 0,

//             historical_logs: patient.historical_logs || [],
//             assigned_expert: patient.assigned_expert || null,

//             // 🌟 Send pending status to frontend too
//             pending_expert: patient.pending_expert || null
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });











// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// // IMPORTING ALL MODELS
// const Product = require('./models/Product');
// const Admin = require('./models/Admin');
// const Patient = require('./models/Patient');
// const Expert = require('./models/Expert');
// const Recipe = require('./models/Recipe');
// const PaymentRequest = require('./models/PaymentRequest');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// const storage = multer.diskStorage({
//     destination: './uploads',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
//     }
// });
// const upload = multer({ storage: storage }).fields([
//     { name: 'certificate', maxCount: 1 },
//     { name: 'receipt', maxCount: 1 }
// ]);

// const dbURI = 'mongodb://taki_db_user:taki2026db@ac-zh59ffq-shard-00-00.j8rp9f4.mongodb.net:27017,ac-zh59ffq-shard-00-01.j8rp9f4.mongodb.net:27017,ac-zh59ffq-shard-00-02.j8rp9f4.mongodb.net:27017/myApp?ssl=true&replicaSet=atlas-di6vmn-shard-0&authSource=admin&appName=Cluster0';

// mongoose.connect(dbURI)
//     .then(() => console.log("✅ Successfully linked to MongoDB Cloud! ☁️"))
//     .catch(err => console.error("❌ MongoDB connection error:", err.message));


// app.get('/', (req, res) => res.send("Server is working"));
// app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// // ==========================================
// // --- PRODUCTS ---
// // ==========================================
// app.get('/products', async (req, res) => {
//     try {
//         const query = {};

//         if (req.query.search && req.query.search.trim() !== "") {
//             query.$or = [
//                 { "Product Name": { $regex: req.query.search, $options: 'i' } },
//                 { "Brand": { $regex: req.query.search, $options: 'i' } }
//             ];
//         }
//         if (req.query.category && req.query.category.trim() !== "") {
//             query.Category = { $regex: req.query.category, $options: 'i' };
//         }

//         const addNumericFilter = (frontendKey, databaseField) => {
//             const min = req.query[`min_${frontendKey}`];
//             const max = req.query[`max_${frontendKey}`];
//             if (min || max) {
//                 query[databaseField] = {};
//                 if (min) query[databaseField].$gte = Number(min);
//                 if (max) query[databaseField].$lte = Number(max);
//             }
//         };

//         addNumericFilter('kcal', 'Energy-Kcal');
//         addNumericFilter('carbs', 'Carbohydrates');
//         addNumericFilter('sugar', 'Sugars');
//         addNumericFilter('fat', 'Fat');
//         addNumericFilter('satFat', 'Saturated-Fat');
//         addNumericFilter('protein', 'Proteins');
//         addNumericFilter('fiber', 'Fiber');
//         addNumericFilter('magnesium', 'Magnesium(mg)');
//         addNumericFilter('calcium', 'Calcium(mg)');
//         addNumericFilter('salt', 'Salt');
//         addNumericFilter('potassium', 'Potassium(mg)');
//         addNumericFilter('sodium', 'Sodium(mg)');

//         const results = await Product.find(query).limit(20);
//         res.json(results);
//     } catch (err) {
//         console.error("Search Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// // ==========================================
// // --- AUTHENTICATION (SIGNUP & LOGIN) ---
// // ==========================================
// app.post('/signup', upload, async (req, res) => {
//     try {
//         const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
//         const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

//         const { name, username, password, role, age, weight, height, plan } = req.body;

//         const existingPatient = await Patient.findOne({ username });
//         const existingExpert = await Expert.findOne({ username });

//         if (existingPatient || existingExpert) {
//             return res.status(400).json({ message: "Username already exists." });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         if (role === 'client') {
//             if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
//                 return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
//             }

//             const newPatient = new Patient({
//                 name, username, password: hashedPassword, age, weight, height, plan: 'free'
//             });
//             await newPatient.save();

//             if (plan === 'plus' || plan === 'pro') {
//                 const receiptPath = receiptFile.path.replace(/\\/g, "/");
//                 const newRequest = new PaymentRequest({
//                     userId: newPatient._id,
//                     username: newPatient.username,
//                     requestedPlan: plan,
//                     receiptImage: receiptPath
//                 });
//                 await newRequest.save();

//                 return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
//             }

//             return res.status(201).json({ message: "Free account created successfully!" });

//         } else if (role === 'expert') {
//             const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

//             const newExpert = new Expert({
//                 name, username, password: hashedPassword,
//                 isVerified: false,
//                 certificateUrl: certPath
//             });
//             await newExpert.save();
//             return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

//         } else {
//             return res.status(400).json({ message: "Invalid role specified." });
//         }
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: err.message });
//     }
// });

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         let user = null;
//         let role = '';
//         let plan = '';

//         user = await Admin.findOne({ username });
//         if (user) role = 'admin';

//         if (!user) {
//             user = await Expert.findOne({ username });
//             if (user) {
//                 role = 'expert';
//                 if (user.isVerified === false) {
//                     return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
//                 }
//             }
//         }

//         if (!user) {
//             user = await Patient.findOne({ username });
//             if (user) {
//                 role = 'client';
//                 plan = user.plan;
//             }
//         }

//         if (!user) return res.status(401).json({ message: "Invalid username or password" });

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

//         const tokenPayload = { userId: user._id, role: role, plan: plan };
//         const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

//         res.json({
//             message: "Login successful",
//             token: token,
//             role: role,
//             plan: plan,
//             user: { id: user._id, name: user.name, username: user.username }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // ==========================================
// // --- 🤝 NEW: ADVANCED MARKETPLACE ROUTES ---
// // ==========================================

// app.put('/patient/:id/request-expert', async (req, res) => {
//     try {
//         const { expertId } = req.body;
//         const patientId = req.params.id;

//         const expert = await Expert.findById(expertId);
//         if (!expert) return res.status(404).json({ message: "Expert not found" });

//         if (expert.supervised_patients.length >= expert.max_clients) {
//             return res.status(400).json({ message: "This expert is fully booked and cannot accept new clients." });
//         }

//         await Patient.findByIdAndUpdate(patientId, { pending_expert: expertId });
//         await Expert.findByIdAndUpdate(expertId, { $addToSet: { pending_requests: patientId } });

//         res.json({ message: "Request sent successfully to the expert!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error sending request", error });
//     }
// });

// app.put('/expert/:expertId/accept-request/:patientId', async (req, res) => {
//     try {
//         const { expertId, patientId } = req.params;

//         const expert = await Expert.findById(expertId);
//         if (expert.supervised_patients.length >= expert.max_clients) {
//             return res.status(400).json({ message: "You have reached your maximum client capacity." });
//         }

//         await Patient.findByIdAndUpdate(patientId, { assigned_expert: expertId, pending_expert: null });

//         await Expert.findByIdAndUpdate(expertId, {
//             $pull: { pending_requests: patientId },
//             $addToSet: { supervised_patients: patientId }
//         });

//         res.json({ message: "Patient accepted into your roster!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error accepting patient", error });
//     }
// });

// app.put('/expert/:expertId/decline-request/:patientId', async (req, res) => {
//     try {
//         const { expertId, patientId } = req.params;
//         await Patient.findByIdAndUpdate(patientId, { pending_expert: null });
//         await Expert.findByIdAndUpdate(expertId, { $pull: { pending_requests: patientId } });
//         res.json({ message: "Patient request declined." });
//     } catch (error) {
//         res.status(500).json({ message: "Error declining patient", error });
//     }
// });

// app.get('/expert/:id/mypatients', async (req, res) => {
//     try {
//         const expertId = req.params.id;
//         const activePatients = await Patient.find({ assigned_expert: expertId }).select('-password');
//         const pendingPatients = await Patient.find({ pending_expert: expertId }).select('-password');

//         res.json({
//             active: activePatients,
//             pending: pendingPatients
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching patients", error });
//     }
// });

// app.put('/expert/:expertId/remove-patient/:patientId', async (req, res) => {
//     try {
//         await Patient.findByIdAndUpdate(req.params.patientId, { assigned_expert: null, pending_expert: null });
//         await Expert.findByIdAndUpdate(req.params.expertId, { $pull: { supervised_patients: req.params.patientId } });
//         res.json({ message: "Patient successfully removed from roster." });
//     } catch (error) {
//         res.status(500).json({ message: "Error removing patient", error });
//     }
// });

// // ==========================================
// // --- PAYMENT VERIFICATION (ADMIN) ---
// // ==========================================
// app.get('/payment-requests', async (req, res) => {
//     try {
//         const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching requests" });
//     }
// });

// app.put('/payment-requests/:id/approve', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'approved';
//         await request.save();

//         await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });
//         res.json({ message: "Patient upgraded successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error approving request", error });
//     }
// });

// app.put('/payment-requests/:id/reject', async (req, res) => {
//     try {
//         const request = await PaymentRequest.findById(req.params.id);
//         if (!request) return res.status(404).json({ message: "Request not found" });

//         request.status = 'rejected';
//         await request.save();

//         res.json({ message: "Payment rejected. Patient stays on Free plan." });
//     } catch (error) {
//         res.status(500).json({ message: "Error rejecting request", error });
//     }
// });

// // ==========================================
// // --- ADMIN CORE ROUTES ---
// // ==========================================
// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Patient updated successfully", patient: updatedPatient });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/patients/:id', async (req, res) => {
//     try {
//         await Patient.findByIdAndDelete(req.params.id);
//         res.json({ message: "Patient deleted successfully" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/recipes', async (req, res) => {
//     try {
//         let query = {};
//         if (req.query.category) {
//             query.category = req.query.category;
//         }
//         const recipes = await Recipe.find(query).populate('ingredients.product');
//         res.json(recipes);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// app.post('/recipes', async (req, res) => {
//     try {
//         const newRecipe = new Recipe(req.body);
//         await newRecipe.save();
//         res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/recipes/:id', async (req, res) => {
//     try {
//         const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Recipe updated!", recipe: updatedRecipe });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/recipes/:id', async (req, res) => {
//     try {
//         await Recipe.findByIdAndDelete(req.params.id);
//         res.json({ message: "Recipe deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/products', async (req, res) => {
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json({ message: "Product created!", product: newProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/products/:id', async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json({ message: "Product updated!", product: updatedProduct });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/products/:id', async (req, res) => {
//     try {
//         await Product.findByIdAndDelete(req.params.id);
//         res.json({ message: "Product deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.get('/experts', async (req, res) => {
//     try {
//         const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
//         res.json(experts);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.post('/experts', async (req, res) => {
//     try {
//         const newExpert = new Expert(req.body);
//         await newExpert.save();
//         res.status(201).json({ message: "Expert created!", expert: newExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/experts/:id', async (req, res) => {
//     try {
//         const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
//         res.json({ message: "Expert updated!", expert: updatedExpert });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/experts/:id', async (req, res) => {
//     try {
//         await Expert.findByIdAndDelete(req.params.id);
//         res.json({ message: "Expert deleted!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ==========================================
// // --- 🌟 PATIENT PROFILE UPDATE ---
// // ==========================================
// app.put('/patient/:id/profile', async (req, res) => {
//     try {
//         console.log(`[PROFILE] Request to update ${req.params.id}:`, req.body);
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const { name, age, weight, height, gender, activity } = req.body;

//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);
//         if (gender) patient.gender = gender;
//         if (activity) patient.activity = activity;

//         if (weight && Number(weight) !== patient.weight) {
//             patient.weight = Number(weight);
//             patient.weight_history.push({ day: new Date(), weight: Number(weight) });
//             console.log(`[PROFILE] Added new weight entry for chart: ${weight}kg`);
//         }

//         await patient.save();

//         res.json({
//             message: "Profile updated!",
//             weight: patient.weight,
//             age: patient.age,
//             height: patient.height,
//             name: patient.name,
//             gender: patient.gender,
//             activity: patient.activity
//         });
//     } catch (error) {
//         console.error("Profile Edit Error:", error);
//         res.status(500).json({ message: "Server error updating profile." });
//     }
// });

// // ==========================================
// // --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// // ==========================================
// app.put('/patient/:id/goals', async (req, res) => {
//     try {
//         const { kcal, protein, carbs, fat } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
//             "Energy-Kcal_goal": Number(kcal),
//             "Protein_goal": Number(protein),
//             "Carbohydrates_goal": Number(carbs),
//             "Fat_goal": Number(fat)
//         }, { new: true, strict: false });

//         if (!updatedPatient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         res.json({ message: "Goals updated successfully!" });
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         res.status(500).json({ message: "Error saving goals", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG MEAL (FLEX MODE) ---
// // ==========================================
// app.post('/patient/:id/log-meal', async (req, res) => {
//     try {
//         const { recipeId, mealType } = req.body;

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = recipeId;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully added to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging meal:", error);
//         res.status(500).json({ message: "Error logging meal", error });
//     }
// });

// // ==========================================
// // --- PATIENT LOG SINGLE PRODUCT (FLEX) ---
// // ==========================================
// app.post('/patient/:id/log-single-product', async (req, res) => {
//     try {
//         const { productId, mealType, amount } = req.body;

//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product not found" });

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
//             preparation_time: "0m",
//             difficulty: "Easy",
//             servings: 1, // Single product log defaults to 1
//             ingredients: [{
//                 product: productId,
//                 amount: `${amount}g`
//             }]
//         });
//         await quickRecipe.save();

//         const updateQuery = {};
//         updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

//         try {
//             await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
//         } catch (pushErr) {
//             await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
//         }

//         res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
//     } catch (error) {
//         console.error("Error logging product:", error);
//         res.status(500).json({ message: "Error logging product", error });
//     }
// });

// // ==========================================
// // --- UPDATE WATER AND STEPS ---
// // ==========================================
// app.put('/patient/:id/water', async (req, res) => {
//     try {
//         const { waterIntake } = req.body;

//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             { "waterIntake": Number(waterIntake) },
//             { new: true, strict: false }
//         );

//         if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
//         res.json({ message: "Water updated!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating water", error });
//     }
// });

// app.put('/patient/:id/steps', async (req, res) => {
//     try {
//         const { stepIntake } = req.body;
//         console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

//         await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

//         res.json({ message: "Steps saved to database!" });
//     } catch (error) {
//         console.error("Error saving steps:", error);
//         res.status(500).json({ message: "Error updating steps." });
//     }
// });

// // ==========================================
// // --- 🛒 AUTO-GENERATE GROCERY LIST ---
// // ==========================================
// app.get('/patient/:id/grocery', async (req, res) => {
//     try {
//         const patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let dailyTotalCost = 0;

//         const processMeals = (mealData) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 // 🌟 FIX: Fetch the servings for math! 🌟
//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();

//                         const amountString = item.amount || "100";
//                         let numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;

//                         // 🌟 FIX: Divide the ingredient amount by the number of servings 🌟
//                         numericAmount = numericAmount / servings;

//                         const multiplier = numericAmount / 100;
//                         const price = parseFloat(prod.Price || 0) * multiplier;

//                         if (!groceryMap[prodId]) {
//                             groceryMap[prodId] = {
//                                 id: prodId,
//                                 name: prod['Product Name'] || prod.Brand || 'Unknown Product',
//                                 unit: 'g',
//                                 amount: 0,
//                                 cost: 0
//                             };
//                         }

//                         groceryMap[prodId].amount += numericAmount;
//                         groceryMap[prodId].cost += price;
//                         dailyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         if (patient.recommended_meals) {
//             processMeals(patient.recommended_meals.breakfast);
//             processMeals(patient.recommended_meals.lunch);
//             processMeals(patient.recommended_meals.dinner);
//             processMeals(patient.recommended_meals.snacks);
//         }

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: (dailyTotalCost * 7).toFixed(2),
//             items: groceryList
//         });

//     } catch (error) {
//         console.error("Grocery Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching grocery list", error });
//     }
// });

// // ==========================================
// // --- 🌟 REAL PATIENT DASHBOARD ROUTE 🌟 ---
// // ==========================================
// app.get('/patient/dashboard/:id', async (req, res) => {
//     try {
//         let patient = await Patient.findById(req.params.id)
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" LOGIC
//         if (patient.last_reset_date && patient.last_reset_date !== todayStr) {

//             // 1. Calculate Yesterday's Macros before deleting them
//             let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//             const calcPastMeals = (mealData) => {
//                 if (!mealData) return;
//                 const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                 recipes.forEach(recipe => {
//                     if (!recipe || !recipe.ingredients) return;

//                     // 🌟 FIX: Fetch the servings for math! 🌟
//                     const servings = recipe.servings || 1;

//                     recipe.ingredients.forEach(item => {
//                         const prod = item.product;
//                         if (prod) {
//                             const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                             const multiplier = numericAmount / 100;

//                             // 🌟 FIX: Divide the total recipe macros by the number of servings 🌟
//                             pastKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                             pastPro += ((prod['Proteins'] || 0) * multiplier) / servings;
//                             pastCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                             pastFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                         }
//                     });
//                 });
//             };

//             if (patient.recommended_meals) {
//                 calcPastMeals(patient.recommended_meals.breakfast);
//                 calcPastMeals(patient.recommended_meals.lunch);
//                 calcPastMeals(patient.recommended_meals.dinner);
//                 calcPastMeals(patient.recommended_meals.snacks);
//             }

//             // 2. Package the Snapshot
//             const snapshot = {
//                 date: patient.last_reset_date,
//                 kcal: Math.round(pastKcal),
//                 protein: Math.round(pastPro),
//                 carbs: Math.round(pastCarbs),
//                 fat: Math.round(pastFat)
//             };

//             // 3. Define reset variables
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr
//             };

//             if (patient.plan === 'plus' || patient.plan === 'free') {
//                 resetData["recommended_meals.breakfast"] = [];
//                 resetData["recommended_meals.lunch"] = [];
//                 resetData["recommended_meals.dinner"] = [];
//                 resetData["recommended_meals.snacks"] = [];
//                 patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             }

//             // 4. Save Snapshot AND Reset Data
//             await Patient.findByIdAndUpdate(patient._id, {
//                 $set: resetData,
//                 $push: { historical_logs: snapshot }
//             }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;

//             if (!patient.historical_logs) patient.historical_logs = [];
//             patient.historical_logs.push(snapshot);

//         } else if (!patient.last_reset_date) {
//             await Patient.findByIdAndUpdate(patient._id, { $set: { last_reset_date: todayStr } }, { strict: false });
//         }

//         // --- CALCULATE TODAY'S MACROS ---
//         let consumedKcal = 0;
//         let consumedFiber = 0;
//         let consumedProtein = 0;
//         let consumedCarbs = 0;
//         let consumedFat = 0;

//         const sumMacrosFromMeal = (mealData) => {
//             if (!mealData) return;

//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;

//                 // 🌟 FIX: Fetch the servings for math! 🌟
//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         // 🌟 FIX: Divide the total recipe macros by the number of servings 🌟
//                         consumedKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                         consumedProtein += ((prod['Proteins'] || 0) * multiplier) / servings;
//                         consumedCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                         consumedFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                         consumedFiber += ((prod['Fiber'] || 0) * multiplier) / servings;
//                     }
//                 });
//             });
//         };

//         const meals = patient.recommended_meals;
//         if (meals) {
//             sumMacrosFromMeal(meals.breakfast);
//             sumMacrosFromMeal(meals.lunch);
//             sumMacrosFromMeal(meals.dinner);
//             sumMacrosFromMeal(meals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             targetKcal: patient["Energy-Kcal_goal"],
//             targetFiber: patient["Fiber_goal"],
//             targetProtein: patient["Protein_goal"],
//             targetCarbs: patient["Carbohydrates_goal"],
//             targetFat: patient["Fat_goal"],

//             currentConsumed: {
//                 kcal: Math.round(consumedKcal),
//                 fiber: Math.round(consumedFiber),
//                 protein: Math.round(consumedProtein),
//                 carbs: Math.round(consumedCarbs),
//                 fat: Math.round(consumedFat)
//             },

//             weight_history: patient.weight_history || [],
//             weight: patient.weight,

//             waterIntake: patient.waterIntake || 0,
//             stepIntake: patient.stepIntake || 0,

//             historical_logs: patient.historical_logs || [],
//             assigned_expert: patient.assigned_expert || null,

//             pending_expert: patient.pending_expert || null
//         };

//         res.json(dashboardData);
//     } catch (error) {
//         console.error("Dashboard Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching dashboard data", error });
//     }
// });

// // 4. START SERVER
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running!`);
//     console.log(`Local: http://localhost:${PORT}`);
//     console.log(`Network: http://192.168.1.102:${PORT}`);
// });








const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = 'my_super_secret_jwt_key_2026';

// IMPORTING ALL MODELS
const Product = require('./models/Product');
const Admin = require('./models/Admin');
const Patient = require('./models/Patient');
const Expert = require('./models/Expert');
const Recipe = require('./models/Recipe');
const PaymentRequest = require('./models/PaymentRequest');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage }).fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'receipt', maxCount: 1 }
]);

const dbURI = 'mongodb://taki_db_user:taki2026db@ac-zh59ffq-shard-00-00.j8rp9f4.mongodb.net:27017,ac-zh59ffq-shard-00-01.j8rp9f4.mongodb.net:27017,ac-zh59ffq-shard-00-02.j8rp9f4.mongodb.net:27017/myApp?ssl=true&replicaSet=atlas-di6vmn-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log("✅ Successfully linked to MongoDB Cloud! ☁️"))
    .catch(err => console.error("❌ MongoDB connection error:", err.message));


app.get('/', (req, res) => res.send("Server is working"));
app.get('/test', (req, res) => res.json({ message: "Test route works", timestamp: new Date() }));

// ==========================================
// --- PRODUCTS ---
// ==========================================
app.get('/products', async (req, res) => {
    try {
        const query = {};

        if (req.query.search && req.query.search.trim() !== "") {
            query.$or = [
                { "Product Name": { $regex: req.query.search, $options: 'i' } },
                { "Brand": { $regex: req.query.search, $options: 'i' } }
            ];
        }
        if (req.query.category && req.query.category.trim() !== "") {
            query.Category = { $regex: req.query.category, $options: 'i' };
        }

        const addNumericFilter = (frontendKey, databaseField) => {
            const min = req.query[`min_${frontendKey}`];
            const max = req.query[`max_${frontendKey}`];
            if (min || max) {
                query[databaseField] = {};
                if (min) query[databaseField].$gte = Number(min);
                if (max) query[databaseField].$lte = Number(max);
            }
        };

        addNumericFilter('kcal', 'Energy-Kcal');
        addNumericFilter('carbs', 'Carbohydrates');
        addNumericFilter('sugar', 'Sugars');
        addNumericFilter('fat', 'Fat');
        addNumericFilter('satFat', 'Saturated-Fat');
        addNumericFilter('protein', 'Proteins');
        addNumericFilter('fiber', 'Fiber');
        addNumericFilter('magnesium', 'Magnesium(mg)');
        addNumericFilter('calcium', 'Calcium(mg)');
        addNumericFilter('salt', 'Salt');
        addNumericFilter('potassium', 'Potassium(mg)');
        addNumericFilter('sodium', 'Sodium(mg)');

        const results = await Product.find(query).limit(20);
        res.json(results);
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// --- AUTHENTICATION (SIGNUP & LOGIN) ---
// ==========================================
app.post('/signup', upload, async (req, res) => {
    try {
        const certFile = req.files && req.files['certificate'] ? req.files['certificate'][0] : null;
        const receiptFile = req.files && req.files['receipt'] ? req.files['receipt'][0] : null;

        const { name, username, password, role, age, weight, height, plan } = req.body;

        const existingPatient = await Patient.findOne({ username });
        const existingExpert = await Expert.findOne({ username });

        if (existingPatient || existingExpert) {
            return res.status(400).json({ message: "Username already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (role === 'client') {
            if ((plan === 'plus' || plan === 'pro') && !receiptFile) {
                return res.status(400).json({ message: "Payment receipt is required for Plus/Pro plans." });
            }

            const newPatient = new Patient({
                name, username, password: hashedPassword, age, weight, height, plan: 'free'
            });
            await newPatient.save();

            if (plan === 'plus' || plan === 'pro') {
                const receiptPath = receiptFile.path.replace(/\\/g, "/");
                const newRequest = new PaymentRequest({
                    userId: newPatient._id,
                    username: newPatient.username,
                    requestedPlan: plan,
                    receiptImage: receiptPath
                });
                await newRequest.save();

                return res.status(201).json({ message: `Account created! Your ${plan.toUpperCase()} plan is pending Admin verification.` });
            }

            return res.status(201).json({ message: "Free account created successfully!" });

        } else if (role === 'expert') {
            const certPath = certFile ? certFile.path.replace(/\\/g, "/") : null;

            const newExpert = new Expert({
                name, username, password: hashedPassword,
                isVerified: false,
                certificateUrl: certPath
            });
            await newExpert.save();
            return res.status(201).json({ message: "Expert pending approval. Admin will review certificate." });

        } else {
            return res.status(400).json({ message: "Invalid role specified." });
        }
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = null;
        let role = '';
        let plan = '';

        user = await Admin.findOne({ username });
        if (user) role = 'admin';

        if (!user) {
            user = await Expert.findOne({ username });
            if (user) {
                role = 'expert';
                if (user.isVerified === false) {
                    return res.status(403).json({ message: "Account pending approval. Please wait for Admin verification." });
                }
            }
        }

        if (!user) {
            user = await Patient.findOne({ username });
            if (user) {
                role = 'client';
                plan = user.plan;
            }
        }

        if (!user) return res.status(401).json({ message: "Invalid username or password" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password" });

        const tokenPayload = { userId: user._id, role: role, plan: plan };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: "Login successful",
            token: token,
            role: role,
            plan: plan,
            user: { id: user._id, name: user.name, username: user.username }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ==========================================
// --- 🤝 ADVANCED MARKETPLACE ROUTES ---
// ==========================================

app.put('/patient/:id/request-expert', async (req, res) => {
    try {
        const { expertId } = req.body;
        const patientId = req.params.id;

        const expert = await Expert.findById(expertId);
        if (!expert) return res.status(404).json({ message: "Expert not found" });

        if (expert.supervised_patients.length >= expert.max_clients) {
            return res.status(400).json({ message: "This expert is fully booked and cannot accept new clients." });
        }

        await Patient.findByIdAndUpdate(patientId, { pending_expert: expertId });
        await Expert.findByIdAndUpdate(expertId, { $addToSet: { pending_requests: patientId } });

        res.json({ message: "Request sent successfully to the expert!" });
    } catch (error) {
        res.status(500).json({ message: "Error sending request", error });
    }
});

app.put('/expert/:expertId/accept-request/:patientId', async (req, res) => {
    try {
        const { expertId, patientId } = req.params;

        const expert = await Expert.findById(expertId);
        if (expert.supervised_patients.length >= expert.max_clients) {
            return res.status(400).json({ message: "You have reached your maximum client capacity." });
        }

        await Patient.findByIdAndUpdate(patientId, { assigned_expert: expertId, pending_expert: null });

        await Expert.findByIdAndUpdate(expertId, {
            $pull: { pending_requests: patientId },
            $addToSet: { supervised_patients: patientId }
        });

        res.json({ message: "Patient accepted into your roster!" });
    } catch (error) {
        res.status(500).json({ message: "Error accepting patient", error });
    }
});

app.put('/expert/:expertId/decline-request/:patientId', async (req, res) => {
    try {
        const { expertId, patientId } = req.params;
        await Patient.findByIdAndUpdate(patientId, { pending_expert: null });
        await Expert.findByIdAndUpdate(expertId, { $pull: { pending_requests: patientId } });
        res.json({ message: "Patient request declined." });
    } catch (error) {
        res.status(500).json({ message: "Error declining patient", error });
    }
});

app.get('/expert/:id/mypatients', async (req, res) => {
    try {
        const expertId = req.params.id;
        const activePatients = await Patient.find({ assigned_expert: expertId }).select('-password');
        const pendingPatients = await Patient.find({ pending_expert: expertId }).select('-password');

        res.json({
            active: activePatients,
            pending: pendingPatients
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching patients", error });
    }
});

app.put('/expert/:expertId/remove-patient/:patientId', async (req, res) => {
    try {
        await Patient.findByIdAndUpdate(req.params.patientId, { assigned_expert: null, pending_expert: null });
        await Expert.findByIdAndUpdate(req.params.expertId, { $pull: { supervised_patients: req.params.patientId } });
        res.json({ message: "Patient successfully removed from roster." });
    } catch (error) {
        res.status(500).json({ message: "Error removing patient", error });
    }
});

// ==========================================
// --- PAYMENT VERIFICATION (ADMIN) ---
// ==========================================
app.get('/payment-requests', async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ status: 'pending' }).populate('userId', 'name username');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching requests" });
    }
});

app.put('/payment-requests/:id/approve', async (req, res) => {
    try {
        const request = await PaymentRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = 'approved';
        await request.save();

        await Patient.findByIdAndUpdate(request.userId, { plan: request.requestedPlan });
        res.json({ message: "Patient upgraded successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error approving request", error });
    }
});

app.put('/payment-requests/:id/reject', async (req, res) => {
    try {
        const request = await PaymentRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = 'rejected';
        await request.save();

        res.json({ message: "Payment rejected. Patient stays on Free plan." });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting request", error });
    }
});

// ==========================================
// --- ADMIN CORE ROUTES ---
// ==========================================
app.get('/patients', async (req, res) => {
    try {
        const patients = await Patient.find().select('-password');
        res.json(patients);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/patients/:id', async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json({ message: "Patient updated successfully", patient: updatedPatient });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/patients/:id', async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: "Patient deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/recipes', async (req, res) => {
    try {
        let query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        const recipes = await Recipe.find(query).populate('ingredients.product');
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/recipes', async (req, res) => {
    try {
        const newRecipe = new Recipe(req.body);
        await newRecipe.save();
        res.status(201).json({ message: "Recipe created!", recipe: newRecipe });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/recipes/:id', async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Recipe updated!", recipe: updatedRecipe });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/recipes/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ message: "Recipe deleted!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Product created!", product: newProduct });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Product updated!", product: updatedProduct });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/experts', async (req, res) => {
    try {
        const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
        res.json(experts);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/experts', async (req, res) => {
    try {
        const newExpert = new Expert(req.body);
        await newExpert.save();
        res.status(201).json({ message: "Expert created!", expert: newExpert });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/experts/:id', async (req, res) => {
    try {
        const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json({ message: "Expert updated!", expert: updatedExpert });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/experts/:id', async (req, res) => {
    try {
        await Expert.findByIdAndDelete(req.params.id);
        res.json({ message: "Expert deleted!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// --- 🌟 PATIENT PROFILE UPDATE ---
// ==========================================
app.put('/patient/:id/profile', async (req, res) => {
    try {
        console.log(`[PROFILE] Request to update ${req.params.id}:`, req.body);
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        const { name, age, weight, height, gender, activity } = req.body;

        if (name) patient.name = name;
        if (age) patient.age = Number(age);
        if (height) patient.height = Number(height);
        if (gender) patient.gender = gender;
        if (activity) patient.activity = activity;

        if (weight && Number(weight) !== patient.weight) {
            patient.weight = Number(weight);
            patient.weight_history.push({ day: new Date(), weight: Number(weight) });
            console.log(`[PROFILE] Added new weight entry for chart: ${weight}kg`);
        }

        await patient.save();

        res.json({
            message: "Profile updated!",
            weight: patient.weight,
            age: patient.age,
            height: patient.height,
            name: patient.name,
            gender: patient.gender,
            activity: patient.activity
        });
    } catch (error) {
        console.error("Profile Edit Error:", error);
        res.status(500).json({ message: "Server error updating profile." });
    }
});

// ==========================================
// --- PATIENT SET OWN GOALS (PLUS PLAN) ---
// ==========================================
app.put('/patient/:id/goals', async (req, res) => {
    try {
        const { kcal, protein, carbs, fat } = req.body;

        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
            "Energy-Kcal_goal": Number(kcal),
            "Protein_goal": Number(protein),
            "Carbohydrates_goal": Number(carbs),
            "Fat_goal": Number(fat)
        }, { new: true, strict: false });

        if (!updatedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json({ message: "Goals updated successfully!" });
    } catch (error) {
        console.error("Error saving goals:", error);
        res.status(500).json({ message: "Error saving goals", error });
    }
});

// ==========================================
// --- PATIENT LOG MEAL (FLEX MODE) ---
// ==========================================
app.post('/patient/:id/log-meal', async (req, res) => {
    try {
        const { recipeId, mealType } = req.body;

        const updateQuery = {};
        updateQuery[`recommended_meals.${mealType}`] = recipeId;

        try {
            await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
        } catch (pushErr) {
            await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [recipeId] } }, { new: true, strict: false });
        }

        res.json({ message: `Successfully added to ${mealType}!` });
    } catch (error) {
        console.error("Error logging meal:", error);
        res.status(500).json({ message: "Error logging meal", error });
    }
});

// ==========================================
// --- PATIENT LOG SINGLE PRODUCT (FLEX) ---
// ==========================================
app.post('/patient/:id/log-single-product', async (req, res) => {
    try {
        const { productId, mealType, amount } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const quickRecipe = new Recipe({
            name: `${product['Product Name'] || product.Brand || 'Product'} (${amount}g)`,
            preparation_time: "0m",
            difficulty: "Easy",
            servings: 1, // Single product log defaults to 1
            ingredients: [{
                product: productId,
                amount: `${amount}g`
            }]
        });
        await quickRecipe.save();

        const updateQuery = {};
        updateQuery[`recommended_meals.${mealType}`] = quickRecipe._id;

        try {
            await Patient.findByIdAndUpdate(req.params.id, { $push: updateQuery }, { new: true, strict: false });
        } catch (pushErr) {
            await Patient.findByIdAndUpdate(req.params.id, { $set: { [`recommended_meals.${mealType}`]: [quickRecipe._id] } }, { new: true, strict: false });
        }

        res.json({ message: `Successfully logged ${amount}g to ${mealType}!` });
    } catch (error) {
        console.error("Error logging product:", error);
        res.status(500).json({ message: "Error logging product", error });
    }
});

// ==========================================
// --- UPDATE WATER AND STEPS ---
// ==========================================
app.put('/patient/:id/water', async (req, res) => {
    try {
        const { waterIntake } = req.body;

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            { "waterIntake": Number(waterIntake) },
            { new: true, strict: false }
        );

        if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
        res.json({ message: "Water updated!" });
    } catch (error) {
        res.status(500).json({ message: "Error updating water", error });
    }
});

app.put('/patient/:id/steps', async (req, res) => {
    try {
        const { stepIntake } = req.body;
        console.log(`[STEPS] Received update for ${req.params.id}: ${stepIntake} steps.`);

        await Patient.findByIdAndUpdate(req.params.id, { "stepIntake": Number(stepIntake) }, { strict: false });

        res.json({ message: "Steps saved to database!" });
    } catch (error) {
        console.error("Error saving steps:", error);
        res.status(500).json({ message: "Error updating steps." });
    }
});

// ==========================================
// --- 🛒 AUTO-GENERATE GROCERY LIST ---
// ==========================================
app.get('/patient/:id/grocery', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
            .lean();

        if (!patient) return res.status(404).json({ message: "Patient not found" });

        const groceryMap = {};
        let dailyTotalCost = 0;

        const processMeals = (mealData) => {
            if (!mealData) return;
            const recipes = Array.isArray(mealData) ? mealData : [mealData];

            recipes.forEach(recipe => {
                if (!recipe || !recipe.ingredients) return;

                const servings = recipe.servings || 1;

                recipe.ingredients.forEach(item => {
                    const prod = item.product;
                    if (prod) {
                        const prodId = prod._id.toString();

                        const amountString = item.amount || "100";
                        let numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;

                        numericAmount = numericAmount / servings;

                        const multiplier = numericAmount / 100;
                        const price = parseFloat(prod.Price || 0) * multiplier;

                        if (!groceryMap[prodId]) {
                            groceryMap[prodId] = {
                                id: prodId,
                                name: prod['Product Name'] || prod.Brand || 'Unknown Product',
                                unit: 'g',
                                amount: 0,
                                cost: 0
                            };
                        }

                        groceryMap[prodId].amount += numericAmount;
                        groceryMap[prodId].cost += price;
                        dailyTotalCost += price;
                    }
                });
            });
        };

        if (patient.recommended_meals) {
            processMeals(patient.recommended_meals.breakfast);
            processMeals(patient.recommended_meals.lunch);
            processMeals(patient.recommended_meals.dinner);
            processMeals(patient.recommended_meals.snacks);
        }

        const groceryList = Object.values(groceryMap).map(item => ({
            ...item,
            amount: Math.round(item.amount),
            cost: item.cost.toFixed(2)
        }));

        res.json({
            dailyCost: dailyTotalCost.toFixed(2),
            weeklyCost: (dailyTotalCost * 7).toFixed(2),
            items: groceryList
        });

    } catch (error) {
        console.error("Grocery Fetch Error:", error);
        res.status(500).json({ message: "Error fetching grocery list", error });
    }
});

// ==========================================
// --- 🌟 REAL PATIENT DASHBOARD ROUTE 🌟 ---
// ==========================================
app.get('/patient/dashboard/:id', async (req, res) => {
    try {
        let patient = await Patient.findById(req.params.id)
            .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } })
            .select('-password')
            .lean();

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const todayStr = new Date().toDateString();

        // 🌟 "NIGHTLY SNAPSHOT" LOGIC
        if (patient.last_reset_date && patient.last_reset_date !== todayStr) {

            let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

            const calcPastMeals = (mealData) => {
                if (!mealData) return;
                const recipes = Array.isArray(mealData) ? mealData : [mealData];
                recipes.forEach(recipe => {
                    if (!recipe || !recipe.ingredients) return;

                    const servings = recipe.servings || 1;

                    recipe.ingredients.forEach(item => {
                        const prod = item.product;
                        if (prod) {
                            const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
                            const multiplier = numericAmount / 100;

                            pastKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
                            pastPro += ((prod['Proteins'] || 0) * multiplier) / servings;
                            pastCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
                            pastFat += ((prod['Fat'] || 0) * multiplier) / servings;
                        }
                    });
                });
            };

            if (patient.recommended_meals) {
                calcPastMeals(patient.recommended_meals.breakfast);
                calcPastMeals(patient.recommended_meals.lunch);
                calcPastMeals(patient.recommended_meals.dinner);
                calcPastMeals(patient.recommended_meals.snacks);
            }

            const snapshot = {
                date: patient.last_reset_date,
                kcal: Math.round(pastKcal),
                protein: Math.round(pastPro),
                carbs: Math.round(pastCarbs),
                fat: Math.round(pastFat)
            };

            const resetData = {
                "waterIntake": 0,
                "stepIntake": 0,
                "last_reset_date": todayStr
            };

            if (patient.plan === 'plus' || patient.plan === 'free') {
                resetData["recommended_meals.breakfast"] = [];
                resetData["recommended_meals.lunch"] = [];
                resetData["recommended_meals.dinner"] = [];
                resetData["recommended_meals.snacks"] = [];
                patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
            }

            await Patient.findByIdAndUpdate(patient._id, {
                $set: resetData,
                $push: { historical_logs: snapshot }
            }, { strict: false });

            patient.waterIntake = 0;
            patient.stepIntake = 0;

            if (!patient.historical_logs) patient.historical_logs = [];
            patient.historical_logs.push(snapshot);

        } else if (!patient.last_reset_date) {
            await Patient.findByIdAndUpdate(patient._id, { $set: { last_reset_date: todayStr } }, { strict: false });
        }

        // --- CALCULATE TODAY'S MACROS ---
        let consumedKcal = 0;
        let consumedFiber = 0;
        let consumedProtein = 0;
        let consumedCarbs = 0;
        let consumedFat = 0;

        const sumMacrosFromMeal = (mealData) => {
            if (!mealData) return;

            const recipes = Array.isArray(mealData) ? mealData : [mealData];

            recipes.forEach(recipe => {
                if (!recipe || !recipe.ingredients) return;

                const servings = recipe.servings || 1;

                recipe.ingredients.forEach(item => {
                    const prod = item.product;
                    if (prod) {
                        const amountString = item.amount || "100";
                        const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
                        const multiplier = numericAmount / 100;

                        consumedKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
                        consumedProtein += ((prod['Proteins'] || 0) * multiplier) / servings;
                        consumedCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
                        consumedFat += ((prod['Fat'] || 0) * multiplier) / servings;
                        consumedFiber += ((prod['Fiber'] || 0) * multiplier) / servings;
                    }
                });
            });
        };

        const meals = patient.recommended_meals;
        if (meals) {
            sumMacrosFromMeal(meals.breakfast);
            sumMacrosFromMeal(meals.lunch);
            sumMacrosFromMeal(meals.dinner);
            sumMacrosFromMeal(meals.snacks);
        }

        const dashboardData = {
            name: patient.name,
            age: patient.age,
            height: patient.height,

            targetKcal: patient["Energy-Kcal_goal"],
            targetFiber: patient["Fiber_goal"],
            targetProtein: patient["Protein_goal"],
            targetCarbs: patient["Carbohydrates_goal"],
            targetFat: patient["Fat_goal"],

            currentConsumed: {
                kcal: Math.round(consumedKcal),
                fiber: Math.round(consumedFiber),
                protein: Math.round(consumedProtein),
                carbs: Math.round(consumedCarbs),
                fat: Math.round(consumedFat)
            },

            weight_history: patient.weight_history || [],
            weight: patient.weight,

            waterIntake: patient.waterIntake || 0,
            stepIntake: patient.stepIntake || 0,

            historical_logs: patient.historical_logs || [],
            assigned_expert: patient.assigned_expert || null,
            pending_expert: patient.pending_expert || null,

            // 🌟 ADDED SO THE APP RECEIVES THE MEALS! 🌟
            recommended_meals: patient.recommended_meals || { breakfast: [], lunch: [], dinner: [], snacks: [] }
        };

        res.json(dashboardData);
    } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        res.status(500).json({ message: "Error fetching dashboard data", error });
    }
});

// 4. START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running!`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.1.102:${PORT}`);
});
