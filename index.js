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
// // --- 🤝 ADVANCED MARKETPLACE ROUTES ---
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

//         const activePatients = await Patient.find({ assigned_expert: expertId })
//             .select('-password')
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } });

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

// app.get('/admin/statistics', async (req, res) => {
//     try {
//         const patients = await Patient.find({}, 'plan createdAt assigned_expert');
//         const experts = await Expert.find({}, 'isVerified');
//         const recipeCount = await Recipe.countDocuments({ isSystemLog: { $ne: true } });
//         const productCount = await Product.countDocuments();

//         let planDistribution = { free: 0, plus: 0, pro: 0 };
//         let monthlySignups = new Array(12).fill(0); // [Jan, Feb, ... Dec]
//         let yearlySignups = {};
//         let recentSignups = { last7Days: 0, last30Days: 0 };
//         let assignedPatients = 0;

//         const currentYear = new Date().getFullYear();
//         const now = new Date();
//         const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//         const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

//         patients.forEach(p => {
//             // Count Plans
//             if (p.plan) {
//                 planDistribution[p.plan] = (planDistribution[p.plan] || 0) + 1;
//             } else {
//                 planDistribution.free += 1; // Default to free if null
//             }

//             // Count Assigned Patients
//             if (p.assigned_expert) {
//                 assignedPatients++;
//             }

//             // Count Dates
//             if (p.createdAt) {
//                 const date = new Date(p.createdAt);
//                 const month = date.getMonth(); // 0-11
//                 const year = date.getFullYear();

//                 if (year === currentYear) {
//                     monthlySignups[month] += 1;
//                 }

//                 yearlySignups[year] = (yearlySignups[year] || 0) + 1;

//                 if (date >= sevenDaysAgo) recentSignups.last7Days++;
//                 if (date >= thirtyDaysAgo) recentSignups.last30Days++;
//             }
//         });

//         // Calculate Estimated MRR
//         const estimatedMRR = (planDistribution.plus * 700) + (planDistribution.pro * 1500);

//         // Calculate Expert Breakdown
//         let verifiedExperts = 0;
//         let pendingExperts = 0;
//         experts.forEach(e => {
//             if (e.isVerified) verifiedExperts++;
//             else pendingExperts++;
//         });

//         res.json({
//             totalPatients: patients.length,
//             assignedPatients,
//             totalExperts: experts.length,
//             verifiedExperts,
//             pendingExperts,
//             totalRecipes: recipeCount,
//             totalProducts: productCount,
//             planDistribution,
//             monthlySignups,
//             yearlySignups,
//             recentSignups,
//             estimatedMRR,
//             currentYear
//         });
//     } catch (error) {
//         console.error("Statistics Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching statistics", error });
//     }
// });

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
//         let query = { isSystemLog: { $ne: true } };

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

//         // 🌟 EXTRACT NEW FIELDS FROM REQUEST
//         const { name, age, weight, height, gender, activity, daily_budget, email, phone, goal_intention } = req.body;

//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);
//         if (gender) patient.gender = gender;
//         if (activity) patient.activity = activity;
//         if (daily_budget !== undefined) patient.daily_budget = Number(daily_budget);

//         // 🌟 SAVE NEW FIELDS
//         if (email !== undefined) patient.email = email;
//         if (phone !== undefined) patient.phone = phone;
//         if (goal_intention !== undefined) patient.goal_intention = goal_intention;

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
//             activity: patient.activity,
//             daily_budget: patient.daily_budget,
//             email: patient.email,
//             phone: patient.phone,
//             goal_intention: patient.goal_intention
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

//         const catMap = { 'breakfast': 'Breakfast', 'lunch': 'Lunch', 'dinner': 'Dinner', 'snacks': 'Snack' };

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'}`,
//             category: catMap[mealType] || 'Snack',
//             preparation_time: "0m",
//             difficulty: "Raw",
//             servings: 1,
//             isSystemLog: true,
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
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//         const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];

//         // Dynamically build the populate query for both legacy and the 7-day calendar
//         let populates = [];
//         meals.forEach(meal => {
//             populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } });
//         });
//         days.forEach(day => {
//             meals.forEach(meal => {
//                 populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } });
//             });
//         });

//         const patient = await Patient.findById(req.params.id).populate(populates).lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let weeklyTotalCost = 0;

//         const processMeals = (mealData, multiplierFactor = 1) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;
//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();
//                         const amountString = item.amount || "100";
//                         let numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;

//                         numericAmount = (numericAmount / servings) * multiplierFactor;

//                         const dbBaseWeight = parseFloat(prod.base_weight || '100') || 100;
//                         const priceMultiplier = numericAmount / dbBaseWeight;
//                         const price = parseFloat(prod.Price || 0) * priceMultiplier;

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
//                         weeklyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         // Determine if we should use the 7-Day loop or the 1-Day Legacy loop
//         let isProWeekly = false;
//         if (patient.plan === 'pro' && patient.weekly_plan) {
//             const hasWeeklyMeals = days.some(day =>
//                 meals.some(meal => patient.weekly_plan[day] && patient.weekly_plan[day][meal] && patient.weekly_plan[day][meal].length > 0)
//             );
//             if (hasWeeklyMeals) isProWeekly = true;
//         }

//         if (isProWeekly) {
//             // 🌟 7-DAY CALENDAR MODE: Loops through every day exactly once
//             days.forEach(day => {
//                 if (patient.weekly_plan[day]) {
//                     processMeals(patient.weekly_plan[day].breakfast, 1);
//                     processMeals(patient.weekly_plan[day].lunch, 1);
//                     processMeals(patient.weekly_plan[day].dinner, 1);
//                     processMeals(patient.weekly_plan[day].snacks, 1);
//                 }
//             });
//         } else if (patient.recommended_meals) {
//             // 🌟 LEGACY MODE: Uses today's log and multiplies it by 7 for an estimate
//             processMeals(patient.recommended_meals.breakfast, 7);
//             processMeals(patient.recommended_meals.lunch, 7);
//             processMeals(patient.recommended_meals.dinner, 7);
//             processMeals(patient.recommended_meals.snacks, 7);
//         }

//         const dailyTotalCost = weeklyTotalCost / 7;

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: weeklyTotalCost.toFixed(2),
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
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//         const mealCategories = ['breakfast', 'lunch', 'dinner', 'snacks'];
//         let populates = [];

//         mealCategories.forEach(meal => populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } }));
//         days.forEach(day => mealCategories.forEach(meal => populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } })));

//         let patient = await Patient.findById(req.params.id)
//             .populate(populates)
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" & PRO PRE-FILL LOGIC
//         if (patient.last_reset_date !== todayStr) {

//             // 1. Archive yesterday's data (ONLY if a previous date exists)
//             if (patient.last_reset_date) {
//                 let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//                 const calcPastMeals = (mealData) => {
//                     if (!mealData) return;
//                     const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                     recipes.forEach(recipe => {
//                         if (!recipe || !recipe.ingredients) return;
//                         const servings = recipe.servings || 1;
//                         recipe.ingredients.forEach(item => {
//                             const prod = item.product;
//                             if (prod) {
//                                 const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                                 const multiplier = numericAmount / 100;
//                                 pastKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                                 pastPro += ((prod['Proteins'] || 0) * multiplier) / servings;
//                                 pastCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                                 pastFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                             }
//                         });
//                     });
//                 };

//                 if (patient.recommended_meals) {
//                     calcPastMeals(patient.recommended_meals.breakfast);
//                     calcPastMeals(patient.recommended_meals.lunch);
//                     calcPastMeals(patient.recommended_meals.dinner);
//                     calcPastMeals(patient.recommended_meals.snacks);
//                 }

//                 const snapshot = {
//                     date: patient.last_reset_date,
//                     kcal: Math.round(pastKcal),
//                     protein: Math.round(pastPro),
//                     carbs: Math.round(pastCarbs),
//                     fat: Math.round(pastFat)
//                 };

//                 if (!patient.historical_logs) patient.historical_logs = [];
//                 patient.historical_logs.push(snapshot);

//                 await Patient.findByIdAndUpdate(patient._id, {
//                     $push: { historical_logs: snapshot }
//                 }, { strict: false });
//             }

//             // 2. Prepare the fresh slate for today
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr,
//                 "recommended_meals.breakfast": [],
//                 "recommended_meals.lunch": [],
//                 "recommended_meals.dinner": [],
//                 "recommended_meals.snacks": []
//             };

//             // 3. EVERYONE (Free, Plus, Pro) gets a clean slate for their daily actual log!
//             patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };

//             // Push the reset to MongoDB
//             await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;
//             patient.last_reset_date = todayStr;
//         }

//         // --- CALCULATE TODAY'S MACROS (Based on actual consumed logs) ---
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

//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                         consumedProtein += ((prod['Proteins'] || 0) * multiplier) / servings;
//                         consumedCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                         consumedFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                         consumedFiber += ((prod['Fiber'] || 0) * multiplier) / servings;
//                     }
//                 });
//             });
//         };

//         const patientMeals = patient.recommended_meals;
//         if (patientMeals) {
//             sumMacrosFromMeal(patientMeals.breakfast);
//             sumMacrosFromMeal(patientMeals.lunch);
//             sumMacrosFromMeal(patientMeals.dinner);
//             sumMacrosFromMeal(patientMeals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             // 🌟 EXTRACT NEW FIELDS FOR APP USE
//             daily_budget: patient.daily_budget || 0,
//             email: patient.email || '',
//             phone: patient.phone || '',
//             goal_intention: patient.goal_intention || 'Maintain',

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
//             pending_expert: patient.pending_expert || null,

//             recommended_meals: patient.recommended_meals || { breakfast: [], lunch: [], dinner: [], snacks: [] },
//             weekly_plan: patient.weekly_plan || {}
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
// // --- PRODUCTS (WITH INFINITE SCROLL) ---
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

//         // 🌟 NEW: Pagination Math for Infinite Scrolling 🌟
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 20; // Default to 20 per fetch
//         const skip = (page - 1) * limit;

//         // Apply skip and limit to dynamically grab the correct "chunk" of products
//         const results = await Product.find(query).skip(skip).limit(limit);

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
// // --- 🤝 ADVANCED MARKETPLACE ROUTES ---
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

//         const activePatients = await Patient.find({ assigned_expert: expertId })
//             .select('-password')
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } });

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

// app.get('/admin/statistics', async (req, res) => {
//     try {
//         const patients = await Patient.find({}, 'plan createdAt assigned_expert');
//         const experts = await Expert.find({}, 'isVerified');
//         const recipeCount = await Recipe.countDocuments({ isSystemLog: { $ne: true } });
//         const productCount = await Product.countDocuments();

//         let planDistribution = { free: 0, plus: 0, pro: 0 };
//         let monthlySignups = new Array(12).fill(0); // [Jan, Feb, ... Dec]
//         let yearlySignups = {};
//         let recentSignups = { last7Days: 0, last30Days: 0 };
//         let assignedPatients = 0;

//         const currentYear = new Date().getFullYear();
//         const now = new Date();
//         const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//         const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

//         patients.forEach(p => {
//             // Count Plans
//             if (p.plan) {
//                 planDistribution[p.plan] = (planDistribution[p.plan] || 0) + 1;
//             } else {
//                 planDistribution.free += 1; // Default to free if null
//             }

//             // Count Assigned Patients
//             if (p.assigned_expert) {
//                 assignedPatients++;
//             }

//             // Count Dates
//             if (p.createdAt) {
//                 const date = new Date(p.createdAt);
//                 const month = date.getMonth(); // 0-11
//                 const year = date.getFullYear();

//                 if (year === currentYear) {
//                     monthlySignups[month] += 1;
//                 }

//                 yearlySignups[year] = (yearlySignups[year] || 0) + 1;

//                 if (date >= sevenDaysAgo) recentSignups.last7Days++;
//                 if (date >= thirtyDaysAgo) recentSignups.last30Days++;
//             }
//         });

//         // Calculate Estimated MRR
//         const estimatedMRR = (planDistribution.plus * 700) + (planDistribution.pro * 1500);

//         // Calculate Expert Breakdown
//         let verifiedExperts = 0;
//         let pendingExperts = 0;
//         experts.forEach(e => {
//             if (e.isVerified) verifiedExperts++;
//             else pendingExperts++;
//         });

//         res.json({
//             totalPatients: patients.length,
//             assignedPatients,
//             totalExperts: experts.length,
//             verifiedExperts,
//             pendingExperts,
//             totalRecipes: recipeCount,
//             totalProducts: productCount,
//             planDistribution,
//             monthlySignups,
//             yearlySignups,
//             recentSignups,
//             estimatedMRR,
//             currentYear
//         });
//     } catch (error) {
//         console.error("Statistics Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching statistics", error });
//     }
// });

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
//         let query = { isSystemLog: { $ne: true } };

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

//         // 🌟 EXTRACT NEW FIELDS FROM REQUEST
//         const { name, age, weight, height, gender, activity, daily_budget, email, phone, goal_intention } = req.body;

//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);
//         if (gender) patient.gender = gender;
//         if (activity) patient.activity = activity;
//         if (daily_budget !== undefined) patient.daily_budget = Number(daily_budget);

//         // 🌟 SAVE NEW FIELDS
//         if (email !== undefined) patient.email = email;
//         if (phone !== undefined) patient.phone = phone;
//         if (goal_intention !== undefined) patient.goal_intention = goal_intention;

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
//             activity: patient.activity,
//             daily_budget: patient.daily_budget,
//             email: patient.email,
//             phone: patient.phone,
//             goal_intention: patient.goal_intention
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

//         const catMap = { 'breakfast': 'Breakfast', 'lunch': 'Lunch', 'dinner': 'Dinner', 'snacks': 'Snack' };

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'}`,
//             category: catMap[mealType] || 'Snack',
//             preparation_time: "0m",
//             difficulty: "Raw",
//             servings: 1,
//             isSystemLog: true,
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
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//         const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];

//         // Dynamically build the populate query for both legacy and the 7-day calendar
//         let populates = [];
//         meals.forEach(meal => {
//             populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } });
//         });
//         days.forEach(day => {
//             meals.forEach(meal => {
//                 populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } });
//             });
//         });

//         const patient = await Patient.findById(req.params.id).populate(populates).lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let weeklyTotalCost = 0;

//         const processMeals = (mealData, multiplierFactor = 1) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;
//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();
//                         const amountString = item.amount || "100";
//                         let numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;

//                         numericAmount = (numericAmount / servings) * multiplierFactor;

//                         const dbBaseWeight = parseFloat(prod.base_weight || '100') || 100;
//                         const priceMultiplier = numericAmount / dbBaseWeight;
//                         const price = parseFloat(prod.Price || 0) * priceMultiplier;

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
//                         weeklyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         // Determine if we should use the 7-Day loop or the 1-Day Legacy loop
//         let isProWeekly = false;
//         if (patient.plan === 'pro' && patient.weekly_plan) {
//             const hasWeeklyMeals = days.some(day =>
//                 meals.some(meal => patient.weekly_plan[day] && patient.weekly_plan[day][meal] && patient.weekly_plan[day][meal].length > 0)
//             );
//             if (hasWeeklyMeals) isProWeekly = true;
//         }

//         if (isProWeekly) {
//             // 🌟 7-DAY CALENDAR MODE: Loops through every day exactly once
//             days.forEach(day => {
//                 if (patient.weekly_plan[day]) {
//                     processMeals(patient.weekly_plan[day].breakfast, 1);
//                     processMeals(patient.weekly_plan[day].lunch, 1);
//                     processMeals(patient.weekly_plan[day].dinner, 1);
//                     processMeals(patient.weekly_plan[day].snacks, 1);
//                 }
//             });
//         } else if (patient.recommended_meals) {
//             // 🌟 LEGACY MODE: Uses today's log and multiplies it by 7 for an estimate
//             processMeals(patient.recommended_meals.breakfast, 7);
//             processMeals(patient.recommended_meals.lunch, 7);
//             processMeals(patient.recommended_meals.dinner, 7);
//             processMeals(patient.recommended_meals.snacks, 7);
//         }

//         const dailyTotalCost = weeklyTotalCost / 7;

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: weeklyTotalCost.toFixed(2),
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
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//         const mealCategories = ['breakfast', 'lunch', 'dinner', 'snacks'];
//         let populates = [];

//         mealCategories.forEach(meal => populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } }));
//         days.forEach(day => mealCategories.forEach(meal => populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } })));

//         let patient = await Patient.findById(req.params.id)
//             .populate(populates)
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" & PRO PRE-FILL LOGIC
//         if (patient.last_reset_date !== todayStr) {

//             // 1. Archive yesterday's data (ONLY if a previous date exists)
//             if (patient.last_reset_date) {
//                 let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//                 const calcPastMeals = (mealData) => {
//                     if (!mealData) return;
//                     const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                     recipes.forEach(recipe => {
//                         if (!recipe || !recipe.ingredients) return;
//                         const servings = recipe.servings || 1;
//                         recipe.ingredients.forEach(item => {
//                             const prod = item.product;
//                             if (prod) {
//                                 const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                                 const multiplier = numericAmount / 100;
//                                 pastKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                                 pastPro += ((prod['Proteins'] || 0) * multiplier) / servings;
//                                 pastCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                                 pastFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                             }
//                         });
//                     });
//                 };

//                 if (patient.recommended_meals) {
//                     calcPastMeals(patient.recommended_meals.breakfast);
//                     calcPastMeals(patient.recommended_meals.lunch);
//                     calcPastMeals(patient.recommended_meals.dinner);
//                     calcPastMeals(patient.recommended_meals.snacks);
//                 }

//                 const snapshot = {
//                     date: patient.last_reset_date,
//                     kcal: Math.round(pastKcal),
//                     protein: Math.round(pastPro),
//                     carbs: Math.round(pastCarbs),
//                     fat: Math.round(pastFat)
//                 };

//                 if (!patient.historical_logs) patient.historical_logs = [];
//                 patient.historical_logs.push(snapshot);

//                 await Patient.findByIdAndUpdate(patient._id, {
//                     $push: { historical_logs: snapshot }
//                 }, { strict: false });
//             }

//             // 2. Prepare the fresh slate for today
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr,
//                 "recommended_meals.breakfast": [],
//                 "recommended_meals.lunch": [],
//                 "recommended_meals.dinner": [],
//                 "recommended_meals.snacks": []
//             };

//             // 3. EVERYONE (Free, Plus, Pro) gets a clean slate for their daily actual log!
//             patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };

//             // Push the reset to MongoDB
//             await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;
//             patient.last_reset_date = todayStr;
//         }

//         // --- CALCULATE TODAY'S MACROS (Based on actual consumed logs) ---
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

//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                         consumedProtein += ((prod['Proteins'] || 0) * multiplier) / servings;
//                         consumedCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                         consumedFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                         consumedFiber += ((prod['Fiber'] || 0) * multiplier) / servings;
//                     }
//                 });
//             });
//         };

//         const patientMeals = patient.recommended_meals;
//         if (patientMeals) {
//             sumMacrosFromMeal(patientMeals.breakfast);
//             sumMacrosFromMeal(patientMeals.lunch);
//             sumMacrosFromMeal(patientMeals.dinner);
//             sumMacrosFromMeal(patientMeals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             // 🌟 EXTRACT NEW FIELDS FOR APP USE
//             daily_budget: patient.daily_budget || 0,
//             email: patient.email || '',
//             phone: patient.phone || '',
//             goal_intention: patient.goal_intention || 'Maintain',

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
//             pending_expert: patient.pending_expert || null,

//             recommended_meals: patient.recommended_meals || { breakfast: [], lunch: [], dinner: [], snacks: [] },
//             weekly_plan: patient.weekly_plan || {}
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
// // --- PRODUCTS (WITH INFINITE SCROLL) ---
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

//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 20;
//         const skip = (page - 1) * limit;

//         const results = await Product.find(query).skip(skip).limit(limit);

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
// // --- 🤝 ADVANCED MARKETPLACE ROUTES ---
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

//         const activePatients = await Patient.find({ assigned_expert: expertId })
//             .select('-password')
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } });

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

// app.get('/admin/statistics', async (req, res) => {
//     try {
//         const patients = await Patient.find({}, 'plan createdAt assigned_expert');
//         const experts = await Expert.find({}, 'isVerified');
//         const recipeCount = await Recipe.countDocuments({ isSystemLog: { $ne: true } });
//         const productCount = await Product.countDocuments();

//         let planDistribution = { free: 0, plus: 0, pro: 0 };
//         let monthlySignups = new Array(12).fill(0); // [Jan, Feb, ... Dec]
//         let yearlySignups = {};
//         let recentSignups = { last7Days: 0, last30Days: 0 };
//         let assignedPatients = 0;

//         const currentYear = new Date().getFullYear();
//         const now = new Date();
//         const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//         const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

//         patients.forEach(p => {
//             // Count Plans
//             if (p.plan) {
//                 planDistribution[p.plan] = (planDistribution[p.plan] || 0) + 1;
//             } else {
//                 planDistribution.free += 1; // Default to free if null
//             }

//             // Count Assigned Patients
//             if (p.assigned_expert) {
//                 assignedPatients++;
//             }

//             // Count Dates
//             if (p.createdAt) {
//                 const date = new Date(p.createdAt);
//                 const month = date.getMonth(); // 0-11
//                 const year = date.getFullYear();

//                 if (year === currentYear) {
//                     monthlySignups[month] += 1;
//                 }

//                 yearlySignups[year] = (yearlySignups[year] || 0) + 1;

//                 if (date >= sevenDaysAgo) recentSignups.last7Days++;
//                 if (date >= thirtyDaysAgo) recentSignups.last30Days++;
//             }
//         });

//         // Calculate Estimated MRR
//         const estimatedMRR = (planDistribution.plus * 700) + (planDistribution.pro * 1500);

//         // Calculate Expert Breakdown
//         let verifiedExperts = 0;
//         let pendingExperts = 0;
//         experts.forEach(e => {
//             if (e.isVerified) verifiedExperts++;
//             else pendingExperts++;
//         });

//         res.json({
//             totalPatients: patients.length,
//             assignedPatients,
//             totalExperts: experts.length,
//             verifiedExperts,
//             pendingExperts,
//             totalRecipes: recipeCount,
//             totalProducts: productCount,
//             planDistribution,
//             monthlySignups,
//             yearlySignups,
//             recentSignups,
//             estimatedMRR,
//             currentYear
//         });
//     } catch (error) {
//         console.error("Statistics Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching statistics", error });
//     }
// });

// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // 🌟 FIX 1: Add { strict: false } to allow saving new database fields on the fly
// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, strict: false }
//         ).select('-password');
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
//         let query = { isSystemLog: { $ne: true } };

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

//         // 🌟 EXTRACT NEW FIELDS FROM REQUEST
//         const { name, age, weight, height, gender, activity, daily_budget, email, phone, goal_intention } = req.body;

//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);
//         if (gender) patient.gender = gender;
//         if (activity) patient.activity = activity;
//         if (daily_budget !== undefined) patient.daily_budget = Number(daily_budget);

//         // 🌟 SAVE NEW FIELDS
//         if (email !== undefined) patient.email = email;
//         if (phone !== undefined) patient.phone = phone;
//         if (goal_intention !== undefined) patient.goal_intention = goal_intention;

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
//             activity: patient.activity,
//             daily_budget: patient.daily_budget,
//             email: patient.email,
//             phone: patient.phone,
//             goal_intention: patient.goal_intention
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

//         const catMap = { 'breakfast': 'Breakfast', 'lunch': 'Lunch', 'dinner': 'Dinner', 'snacks': 'Snack' };

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'}`,
//             category: catMap[mealType] || 'Snack',
//             preparation_time: "0m",
//             difficulty: "Raw",
//             servings: 1,
//             isSystemLog: true,
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
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//         const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];

//         // Dynamically build the populate query for both legacy and the 7-day calendar
//         let populates = [];
//         meals.forEach(meal => {
//             populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } });
//         });
//         days.forEach(day => {
//             meals.forEach(meal => {
//                 populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } });
//             });
//         });

//         const patient = await Patient.findById(req.params.id).populate(populates).lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let weeklyTotalCost = 0;

//         const processMeals = (mealData, multiplierFactor = 1) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;
//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();
//                         const amountString = item.amount || "100";
//                         let numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;

//                         numericAmount = (numericAmount / servings) * multiplierFactor;

//                         const dbBaseWeight = parseFloat(prod.base_weight || '100') || 100;
//                         const priceMultiplier = numericAmount / dbBaseWeight;
//                         const price = parseFloat(prod.Price || 0) * priceMultiplier;

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
//                         weeklyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         // Determine if we should use the 7-Day loop or the 1-Day Legacy loop
//         let isProWeekly = false;
//         if (patient.plan === 'pro' && patient.weekly_plan) {
//             const hasWeeklyMeals = days.some(day =>
//                 meals.some(meal => patient.weekly_plan[day] && patient.weekly_plan[day][meal] && patient.weekly_plan[day][meal].length > 0)
//             );
//             if (hasWeeklyMeals) isProWeekly = true;
//         }

//         if (isProWeekly) {
//             // 🌟 7-DAY CALENDAR MODE: Loops through every day exactly once
//             days.forEach(day => {
//                 if (patient.weekly_plan[day]) {
//                     processMeals(patient.weekly_plan[day].breakfast, 1);
//                     processMeals(patient.weekly_plan[day].lunch, 1);
//                     processMeals(patient.weekly_plan[day].dinner, 1);
//                     processMeals(patient.weekly_plan[day].snacks, 1);
//                 }
//             });
//         } else if (patient.recommended_meals) {
//             // 🌟 LEGACY MODE: Uses today's log and multiplies it by 7 for an estimate
//             processMeals(patient.recommended_meals.breakfast, 7);
//             processMeals(patient.recommended_meals.lunch, 7);
//             processMeals(patient.recommended_meals.dinner, 7);
//             processMeals(patient.recommended_meals.snacks, 7);
//         }

//         const dailyTotalCost = weeklyTotalCost / 7;

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: weeklyTotalCost.toFixed(2),
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
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//         const mealCategories = ['breakfast', 'lunch', 'dinner', 'snacks'];
//         let populates = [];

//         mealCategories.forEach(meal => populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } }));
//         days.forEach(day => mealCategories.forEach(meal => populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } })));

//         let patient = await Patient.findById(req.params.id)
//             .populate(populates)
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" & PRO PRE-FILL LOGIC
//         if (patient.last_reset_date !== todayStr) {

//             // 1. Archive yesterday's data (ONLY if a previous date exists)
//             if (patient.last_reset_date) {
//                 let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//                 const calcPastMeals = (mealData) => {
//                     if (!mealData) return;
//                     const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                     recipes.forEach(recipe => {
//                         if (!recipe || !recipe.ingredients) return;
//                         const servings = recipe.servings || 1;
//                         recipe.ingredients.forEach(item => {
//                             const prod = item.product;
//                             if (prod) {
//                                 const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                                 const multiplier = numericAmount / 100;
//                                 pastKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                                 pastPro += ((prod['Proteins'] || 0) * multiplier) / servings;
//                                 pastCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                                 pastFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                             }
//                         });
//                     });
//                 };

//                 if (patient.recommended_meals) {
//                     calcPastMeals(patient.recommended_meals.breakfast);
//                     calcPastMeals(patient.recommended_meals.lunch);
//                     calcPastMeals(patient.recommended_meals.dinner);
//                     calcPastMeals(patient.recommended_meals.snacks);
//                 }

//                 const snapshot = {
//                     date: patient.last_reset_date,
//                     kcal: Math.round(pastKcal),
//                     protein: Math.round(pastPro),
//                     carbs: Math.round(pastCarbs),
//                     fat: Math.round(pastFat)
//                 };

//                 if (!patient.historical_logs) patient.historical_logs = [];
//                 patient.historical_logs.push(snapshot);

//                 await Patient.findByIdAndUpdate(patient._id, {
//                     $push: { historical_logs: snapshot }
//                 }, { strict: false });
//             }

//             // 2. Prepare the fresh slate for today
//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr,
//                 "recommended_meals.breakfast": [],
//                 "recommended_meals.lunch": [],
//                 "recommended_meals.dinner": [],
//                 "recommended_meals.snacks": []
//             };

//             // 3. EVERYONE (Free, Plus, Pro) gets a clean slate for their daily actual log!
//             patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };

//             // Push the reset to MongoDB
//             await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;
//             patient.last_reset_date = todayStr;
//         }

//         // --- CALCULATE TODAY'S MACROS (Based on actual consumed logs) ---
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

//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                         consumedProtein += ((prod['Proteins'] || 0) * multiplier) / servings;
//                         consumedCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                         consumedFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                         consumedFiber += ((prod['Fiber'] || 0) * multiplier) / servings;
//                     }
//                 });
//             });
//         };

//         const patientMeals = patient.recommended_meals;
//         if (patientMeals) {
//             sumMacrosFromMeal(patientMeals.breakfast);
//             sumMacrosFromMeal(patientMeals.lunch);
//             sumMacrosFromMeal(patientMeals.dinner);
//             sumMacrosFromMeal(patientMeals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             age: patient.age,
//             height: patient.height,

//             // 🌟 EXTRACT NEW FIELDS FOR APP USE
//             daily_budget: patient.daily_budget || 0,
//             email: patient.email || '',
//             phone: patient.phone || '',
//             goal_intention: patient.goal_intention || 'Maintain',

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

//             // 🌟 FIX 2: EXPLICITLY RETURN THE TIMESTAMP TO THE FRONTEND 🌟
//             last_meal_update: patient.last_meal_update || null,

//             historical_logs: patient.historical_logs || [],
//             assigned_expert: patient.assigned_expert || null,
//             pending_expert: patient.pending_expert || null,

//             recommended_meals: patient.recommended_meals || { breakfast: [], lunch: [], dinner: [], snacks: [] },
//             weekly_plan: patient.weekly_plan || {}
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
// // --- PRODUCTS (WITH INFINITE SCROLL) ---
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

//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 20;
//         const skip = (page - 1) * limit;

//         const results = await Product.find(query).skip(skip).limit(limit);

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
// // --- 🤝 ADVANCED MARKETPLACE ROUTES ---
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

//         const activePatients = await Patient.find({ assigned_expert: expertId })
//             .select('-password')
//             .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
//             .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } });

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

// app.get('/admin/statistics', async (req, res) => {
//     try {
//         const patients = await Patient.find({}, 'plan createdAt assigned_expert');
//         const experts = await Expert.find({}, 'isVerified');
//         const recipeCount = await Recipe.countDocuments({ isSystemLog: { $ne: true } });
//         const productCount = await Product.countDocuments();

//         let planDistribution = { free: 0, plus: 0, pro: 0 };
//         let monthlySignups = new Array(12).fill(0); // [Jan, Feb, ... Dec]
//         let yearlySignups = {};
//         let recentSignups = { last7Days: 0, last30Days: 0 };
//         let assignedPatients = 0;

//         const currentYear = new Date().getFullYear();
//         const now = new Date();
//         const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//         const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

//         patients.forEach(p => {
//             // Count Plans
//             if (p.plan) {
//                 planDistribution[p.plan] = (planDistribution[p.plan] || 0) + 1;
//             } else {
//                 planDistribution.free += 1; // Default to free if null
//             }

//             // Count Assigned Patients
//             if (p.assigned_expert) {
//                 assignedPatients++;
//             }

//             // Count Dates
//             if (p.createdAt) {
//                 const date = new Date(p.createdAt);
//                 const month = date.getMonth(); // 0-11
//                 const year = date.getFullYear();

//                 if (year === currentYear) {
//                     monthlySignups[month] += 1;
//                 }

//                 yearlySignups[year] = (yearlySignups[year] || 0) + 1;

//                 if (date >= sevenDaysAgo) recentSignups.last7Days++;
//                 if (date >= thirtyDaysAgo) recentSignups.last30Days++;
//             }
//         });

//         // Calculate Estimated MRR
//         const estimatedMRR = (planDistribution.plus * 700) + (planDistribution.pro * 1500);

//         // Calculate Expert Breakdown
//         let verifiedExperts = 0;
//         let pendingExperts = 0;
//         experts.forEach(e => {
//             if (e.isVerified) verifiedExperts++;
//             else pendingExperts++;
//         });

//         res.json({
//             totalPatients: patients.length,
//             assignedPatients,
//             totalExperts: experts.length,
//             verifiedExperts,
//             pendingExperts,
//             totalRecipes: recipeCount,
//             totalProducts: productCount,
//             planDistribution,
//             monthlySignups,
//             yearlySignups,
//             recentSignups,
//             estimatedMRR,
//             currentYear
//         });
//     } catch (error) {
//         console.error("Statistics Fetch Error:", error);
//         res.status(500).json({ message: "Error fetching statistics", error });
//     }
// });

// app.get('/patients', async (req, res) => {
//     try {
//         const patients = await Patient.find().select('-password');
//         res.json(patients);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/patients/:id', async (req, res) => {
//     try {
//         const updatedPatient = await Patient.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, strict: false }
//         ).select('-password');
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
//         let query = { isSystemLog: { $ne: true } };

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
// // --- 🌟 PATIENT PROFILE UPDATE (FIXED CREDENTIALS!) ---
// // ==========================================
// app.put('/patient/:id/profile', async (req, res) => {
//     try {
//         console.log(`[PROFILE] Request to update ${req.params.id}:`, req.body);
//         const patient = await Patient.findById(req.params.id);
//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         // 🌟 EXTRACT ALL FIELDS INCLUDING USERNAME & PASSWORD
//         const { name, age, weight, height, gender, activity, daily_budget, email, phone, goal_intention, username, password } = req.body;

//         // 🌟 HANDLE USERNAME SECURELY
//         if (username && username.trim() !== '') {
//             const existingUser = await Patient.findOne({ username: username.trim(), _id: { $ne: req.params.id } });
//             if (existingUser) {
//                 return res.status(400).json({ message: "Username already taken. Please choose another." });
//             }
//             patient.username = username.trim();
//         }

//         // 🌟 HANDLE PASSWORD SECURELY (HASHING)
//         if (password && password.trim() !== '') {
//             const salt = await bcrypt.genSalt(10);
//             patient.password = await bcrypt.hash(password.trim(), salt);
//         }

//         // 🌟 HANDLE PHYSICAL & PROFILE FIELDS
//         if (name) patient.name = name;
//         if (age) patient.age = Number(age);
//         if (height) patient.height = Number(height);
//         if (gender) patient.gender = gender;
//         if (activity) patient.activity = activity;
//         if (daily_budget !== undefined) patient.daily_budget = Number(daily_budget);
//         if (email !== undefined) patient.email = email;
//         if (phone !== undefined) patient.phone = phone;
//         if (goal_intention !== undefined) patient.goal_intention = goal_intention;

//         if (weight && Number(weight) !== patient.weight) {
//             patient.weight = Number(weight);
//             patient.weight_history.push({ day: new Date(), weight: Number(weight) });
//             console.log(`[PROFILE] Added new weight entry for chart: ${weight}kg`);
//         }

//         await patient.save();

//         res.json({
//             message: "Profile updated!",
//             username: patient.username, // Send back the new username just in case
//             weight: patient.weight,
//             age: patient.age,
//             height: patient.height,
//             name: patient.name,
//             gender: patient.gender,
//             activity: patient.activity,
//             daily_budget: patient.daily_budget,
//             email: patient.email,
//             phone: patient.phone,
//             goal_intention: patient.goal_intention
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

//         const catMap = { 'breakfast': 'Breakfast', 'lunch': 'Lunch', 'dinner': 'Dinner', 'snacks': 'Snack' };

//         const quickRecipe = new Recipe({
//             name: `${product['Product Name'] || product.Brand || 'Product'}`,
//             category: catMap[mealType] || 'Snack',
//             preparation_time: "0m",
//             difficulty: "Raw",
//             servings: 1,
//             isSystemLog: true,
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
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//         const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];

//         let populates = [];
//         meals.forEach(meal => {
//             populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } });
//         });
//         days.forEach(day => {
//             meals.forEach(meal => {
//                 populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } });
//             });
//         });

//         const patient = await Patient.findById(req.params.id).populate(populates).lean();

//         if (!patient) return res.status(404).json({ message: "Patient not found" });

//         const groceryMap = {};
//         let weeklyTotalCost = 0;

//         const processMeals = (mealData, multiplierFactor = 1) => {
//             if (!mealData) return;
//             const recipes = Array.isArray(mealData) ? mealData : [mealData];

//             recipes.forEach(recipe => {
//                 if (!recipe || !recipe.ingredients) return;
//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const prodId = prod._id.toString();
//                         const amountString = item.amount || "100";
//                         let numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;

//                         numericAmount = (numericAmount / servings) * multiplierFactor;

//                         const dbBaseWeight = parseFloat(prod.base_weight || '100') || 100;
//                         const priceMultiplier = numericAmount / dbBaseWeight;
//                         const price = parseFloat(prod.Price || 0) * priceMultiplier;

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
//                         weeklyTotalCost += price;
//                     }
//                 });
//             });
//         };

//         let isProWeekly = false;
//         if (patient.plan === 'pro' && patient.weekly_plan) {
//             const hasWeeklyMeals = days.some(day =>
//                 meals.some(meal => patient.weekly_plan[day] && patient.weekly_plan[day][meal] && patient.weekly_plan[day][meal].length > 0)
//             );
//             if (hasWeeklyMeals) isProWeekly = true;
//         }

//         if (isProWeekly) {
//             days.forEach(day => {
//                 if (patient.weekly_plan[day]) {
//                     processMeals(patient.weekly_plan[day].breakfast, 1);
//                     processMeals(patient.weekly_plan[day].lunch, 1);
//                     processMeals(patient.weekly_plan[day].dinner, 1);
//                     processMeals(patient.weekly_plan[day].snacks, 1);
//                 }
//             });
//         } else if (patient.recommended_meals) {
//             processMeals(patient.recommended_meals.breakfast, 7);
//             processMeals(patient.recommended_meals.lunch, 7);
//             processMeals(patient.recommended_meals.dinner, 7);
//             processMeals(patient.recommended_meals.snacks, 7);
//         }

//         const dailyTotalCost = weeklyTotalCost / 7;

//         const groceryList = Object.values(groceryMap).map(item => ({
//             ...item,
//             amount: Math.round(item.amount),
//             cost: item.cost.toFixed(2)
//         }));

//         res.json({
//             dailyCost: dailyTotalCost.toFixed(2),
//             weeklyCost: weeklyTotalCost.toFixed(2),
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
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//         const mealCategories = ['breakfast', 'lunch', 'dinner', 'snacks'];
//         let populates = [];

//         mealCategories.forEach(meal => populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } }));
//         days.forEach(day => mealCategories.forEach(meal => populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } })));

//         let patient = await Patient.findById(req.params.id)
//             .populate(populates)
//             .select('-password')
//             .lean();

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         const todayStr = new Date().toDateString();

//         // 🌟 "NIGHTLY SNAPSHOT" & PRO PRE-FILL LOGIC
//         if (patient.last_reset_date !== todayStr) {
//             if (patient.last_reset_date) {
//                 let pastKcal = 0, pastPro = 0, pastCarbs = 0, pastFat = 0;

//                 const calcPastMeals = (mealData) => {
//                     if (!mealData) return;
//                     const recipes = Array.isArray(mealData) ? mealData : [mealData];
//                     recipes.forEach(recipe => {
//                         if (!recipe || !recipe.ingredients) return;
//                         const servings = recipe.servings || 1;
//                         recipe.ingredients.forEach(item => {
//                             const prod = item.product;
//                             if (prod) {
//                                 const numericAmount = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 100;
//                                 const multiplier = numericAmount / 100;
//                                 pastKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                                 pastPro += ((prod['Proteins'] || 0) * multiplier) / servings;
//                                 pastCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                                 pastFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                             }
//                         });
//                     });
//                 };

//                 if (patient.recommended_meals) {
//                     calcPastMeals(patient.recommended_meals.breakfast);
//                     calcPastMeals(patient.recommended_meals.lunch);
//                     calcPastMeals(patient.recommended_meals.dinner);
//                     calcPastMeals(patient.recommended_meals.snacks);
//                 }

//                 const snapshot = {
//                     date: patient.last_reset_date,
//                     kcal: Math.round(pastKcal),
//                     protein: Math.round(pastPro),
//                     carbs: Math.round(pastCarbs),
//                     fat: Math.round(pastFat)
//                 };

//                 if (!patient.historical_logs) patient.historical_logs = [];
//                 patient.historical_logs.push(snapshot);

//                 await Patient.findByIdAndUpdate(patient._id, {
//                     $push: { historical_logs: snapshot }
//                 }, { strict: false });
//             }

//             const resetData = {
//                 "waterIntake": 0,
//                 "stepIntake": 0,
//                 "last_reset_date": todayStr,
//                 "recommended_meals.breakfast": [],
//                 "recommended_meals.lunch": [],
//                 "recommended_meals.dinner": [],
//                 "recommended_meals.snacks": []
//             };

//             patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
//             await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });

//             patient.waterIntake = 0;
//             patient.stepIntake = 0;
//             patient.last_reset_date = todayStr;
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

//                 const servings = recipe.servings || 1;

//                 recipe.ingredients.forEach(item => {
//                     const prod = item.product;
//                     if (prod) {
//                         const amountString = item.amount || "100";
//                         const numericAmount = parseFloat(amountString.replace(/[^0-9.]/g, '')) || 100;
//                         const multiplier = numericAmount / 100;

//                         consumedKcal += ((prod['Energy-Kcal'] || 0) * multiplier) / servings;
//                         consumedProtein += ((prod['Proteins'] || 0) * multiplier) / servings;
//                         consumedCarbs += ((prod['Carbohydrates'] || 0) * multiplier) / servings;
//                         consumedFat += ((prod['Fat'] || 0) * multiplier) / servings;
//                         consumedFiber += ((prod['Fiber'] || 0) * multiplier) / servings;
//                     }
//                 });
//             });
//         };

//         const patientMeals = patient.recommended_meals;
//         if (patientMeals) {
//             sumMacrosFromMeal(patientMeals.breakfast);
//             sumMacrosFromMeal(patientMeals.lunch);
//             sumMacrosFromMeal(patientMeals.dinner);
//             sumMacrosFromMeal(patientMeals.snacks);
//         }

//         const dashboardData = {
//             name: patient.name,
//             username: patient.username, // 🌟 Ensure username is passed explicitly
//             age: patient.age,
//             height: patient.height,

//             daily_budget: patient.daily_budget || 0,
//             email: patient.email || '',
//             phone: patient.phone || '',
//             goal_intention: patient.goal_intention || 'Maintain',

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

//             last_meal_update: patient.last_meal_update || null,

//             historical_logs: patient.historical_logs || [],
//             assigned_expert: patient.assigned_expert || null,
//             pending_expert: patient.pending_expert || null,

//             recommended_meals: patient.recommended_meals || { breakfast: [], lunch: [], dinner: [], snacks: [] },
//             weekly_plan: patient.weekly_plan || {}
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
// --- PRODUCTS (WITH INFINITE SCROLL) ---
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

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const results = await Product.find(query).skip(skip).limit(limit);

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

        const activePatients = await Patient.find({ assigned_expert: expertId })
            .select('-password')
            .populate({ path: 'recommended_meals.breakfast', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.lunch', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.dinner', populate: { path: 'ingredients.product' } })
            .populate({ path: 'recommended_meals.snacks', populate: { path: 'ingredients.product' } });

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

app.get('/admin/statistics', async (req, res) => {
    try {
        const patients = await Patient.find({}, 'plan createdAt assigned_expert');
        const experts = await Expert.find({}, 'isVerified');
        const recipeCount = await Recipe.countDocuments({ isSystemLog: { $ne: true } });
        const productCount = await Product.countDocuments();

        let planDistribution = { free: 0, plus: 0, pro: 0 };
        let monthlySignups = new Array(12).fill(0); // [Jan, Feb, ... Dec]
        let yearlySignups = {};
        let recentSignups = { last7Days: 0, last30Days: 0 };
        let assignedPatients = 0;

        const currentYear = new Date().getFullYear();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        patients.forEach(p => {
            // Count Plans
            if (p.plan) {
                planDistribution[p.plan] = (planDistribution[p.plan] || 0) + 1;
            } else {
                planDistribution.free += 1; // Default to free if null
            }

            // Count Assigned Patients
            if (p.assigned_expert) {
                assignedPatients++;
            }

            // Count Dates
            if (p.createdAt) {
                const date = new Date(p.createdAt);
                const month = date.getMonth(); // 0-11
                const year = date.getFullYear();

                if (year === currentYear) {
                    monthlySignups[month] += 1;
                }

                yearlySignups[year] = (yearlySignups[year] || 0) + 1;

                if (date >= sevenDaysAgo) recentSignups.last7Days++;
                if (date >= thirtyDaysAgo) recentSignups.last30Days++;
            }
        });

        // Calculate Estimated MRR
        const estimatedMRR = (planDistribution.plus * 700) + (planDistribution.pro * 1500);

        // Calculate Expert Breakdown
        let verifiedExperts = 0;
        let pendingExperts = 0;
        experts.forEach(e => {
            if (e.isVerified) verifiedExperts++;
            else pendingExperts++;
        });

        res.json({
            totalPatients: patients.length,
            assignedPatients,
            totalExperts: experts.length,
            verifiedExperts,
            pendingExperts,
            totalRecipes: recipeCount,
            totalProducts: productCount,
            planDistribution,
            monthlySignups,
            yearlySignups,
            recentSignups,
            estimatedMRR,
            currentYear
        });
    } catch (error) {
        console.error("Statistics Fetch Error:", error);
        res.status(500).json({ message: "Error fetching statistics", error });
    }
});

app.get('/patients', async (req, res) => {
    try {
        const patients = await Patient.find().select('-password');
        res.json(patients);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/patients/:id', async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, strict: false }
        ).select('-password');
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
        let query = { isSystemLog: { $ne: true } };

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


// ==========================================
// --- 🌟 EXPERT CORE & PROFILE ROUTES 🌟 ---
// ==========================================

app.get('/experts', async (req, res) => {
    try {
        const experts = await Expert.find().populate('supervised_patients', 'name username').select('-password');
        res.json(experts);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🌟 NEW: Fetch specific expert profile for the mobile app
app.get('/expert/profile/:id', async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id).select('-password');
        if (!expert) return res.status(404).json({ message: "Expert not found" });
        res.json(expert);
    } catch (error) {
        res.status(500).json({ message: "Error fetching expert profile" });
    }
});

app.post('/experts', async (req, res) => {
    try {
        const newExpert = new Expert(req.body);
        await newExpert.save();
        res.status(201).json({ message: "Expert created!", expert: newExpert });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🌟 UPGRADED: Secure Expert Profile Update (Handles Password Hashing & Duplicate Usernames)
app.put('/experts/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Securely handle username change
        if (updateData.username && updateData.username.trim() !== '') {
            const existingUser = await Expert.findOne({ username: updateData.username.trim(), _id: { $ne: req.params.id } });
            if (existingUser) return res.status(400).json({ message: "Username already taken." });
            updateData.username = updateData.username.trim();
        }

        // Securely handle password hashing
        if (updateData.password && updateData.password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password.trim(), salt);
        } else {
            delete updateData.password; // Don't overwrite password if they left the field blank
        }

        const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        res.json({ message: "Expert profile updated successfully!", expert: updatedExpert });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/experts/:id', async (req, res) => {
    try {
        await Expert.findByIdAndDelete(req.params.id);
        res.json({ message: "Expert deleted!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// --- 🌟 PATIENT PROFILE UPDATE (FIXED CREDENTIALS!) ---
// ==========================================
app.put('/patient/:id/profile', async (req, res) => {
    try {
        console.log(`[PROFILE] Request to update ${req.params.id}:`, req.body);
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        // 🌟 EXTRACT ALL FIELDS INCLUDING USERNAME & PASSWORD
        const { name, age, weight, height, gender, activity, daily_budget, email, phone, goal_intention, username, password } = req.body;

        // 🌟 HANDLE USERNAME SECURELY
        if (username && username.trim() !== '') {
            const existingUser = await Patient.findOne({ username: username.trim(), _id: { $ne: req.params.id } });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken. Please choose another." });
            }
            patient.username = username.trim();
        }

        // 🌟 HANDLE PASSWORD SECURELY (HASHING)
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            patient.password = await bcrypt.hash(password.trim(), salt);
        }

        // 🌟 HANDLE PHYSICAL & PROFILE FIELDS
        if (name) patient.name = name;
        if (age) patient.age = Number(age);
        if (height) patient.height = Number(height);
        if (gender) patient.gender = gender;
        if (activity) patient.activity = activity;
        if (daily_budget !== undefined) patient.daily_budget = Number(daily_budget);
        if (email !== undefined) patient.email = email;
        if (phone !== undefined) patient.phone = phone;
        if (goal_intention !== undefined) patient.goal_intention = goal_intention;

        if (weight && Number(weight) !== patient.weight) {
            patient.weight = Number(weight);
            patient.weight_history.push({ day: new Date(), weight: Number(weight) });
            console.log(`[PROFILE] Added new weight entry for chart: ${weight}kg`);
        }

        await patient.save();

        res.json({
            message: "Profile updated!",
            username: patient.username, // Send back the new username just in case
            weight: patient.weight,
            age: patient.age,
            height: patient.height,
            name: patient.name,
            gender: patient.gender,
            activity: patient.activity,
            daily_budget: patient.daily_budget,
            email: patient.email,
            phone: patient.phone,
            goal_intention: patient.goal_intention
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

        const catMap = { 'breakfast': 'Breakfast', 'lunch': 'Lunch', 'dinner': 'Dinner', 'snacks': 'Snack' };

        const quickRecipe = new Recipe({
            name: `${product['Product Name'] || product.Brand || 'Product'}`,
            category: catMap[mealType] || 'Snack',
            preparation_time: "0m",
            difficulty: "Raw",
            servings: 1,
            isSystemLog: true,
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
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];

        let populates = [];
        meals.forEach(meal => {
            populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } });
        });
        days.forEach(day => {
            meals.forEach(meal => {
                populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } });
            });
        });

        const patient = await Patient.findById(req.params.id).populate(populates).lean();

        if (!patient) return res.status(404).json({ message: "Patient not found" });

        const groceryMap = {};
        let weeklyTotalCost = 0;

        const processMeals = (mealData, multiplierFactor = 1) => {
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

                        numericAmount = (numericAmount / servings) * multiplierFactor;

                        const dbBaseWeight = parseFloat(prod.base_weight || '100') || 100;
                        const priceMultiplier = numericAmount / dbBaseWeight;
                        const price = parseFloat(prod.Price || 0) * priceMultiplier;

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
                        weeklyTotalCost += price;
                    }
                });
            });
        };

        let isProWeekly = false;
        if (patient.plan === 'pro' && patient.weekly_plan) {
            const hasWeeklyMeals = days.some(day =>
                meals.some(meal => patient.weekly_plan[day] && patient.weekly_plan[day][meal] && patient.weekly_plan[day][meal].length > 0)
            );
            if (hasWeeklyMeals) isProWeekly = true;
        }

        if (isProWeekly) {
            days.forEach(day => {
                if (patient.weekly_plan[day]) {
                    processMeals(patient.weekly_plan[day].breakfast, 1);
                    processMeals(patient.weekly_plan[day].lunch, 1);
                    processMeals(patient.weekly_plan[day].dinner, 1);
                    processMeals(patient.weekly_plan[day].snacks, 1);
                }
            });
        } else if (patient.recommended_meals) {
            processMeals(patient.recommended_meals.breakfast, 7);
            processMeals(patient.recommended_meals.lunch, 7);
            processMeals(patient.recommended_meals.dinner, 7);
            processMeals(patient.recommended_meals.snacks, 7);
        }

        const dailyTotalCost = weeklyTotalCost / 7;

        const groceryList = Object.values(groceryMap).map(item => ({
            ...item,
            amount: Math.round(item.amount),
            cost: item.cost.toFixed(2)
        }));

        res.json({
            dailyCost: dailyTotalCost.toFixed(2),
            weeklyCost: weeklyTotalCost.toFixed(2),
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
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const mealCategories = ['breakfast', 'lunch', 'dinner', 'snacks'];
        let populates = [];

        mealCategories.forEach(meal => populates.push({ path: `recommended_meals.${meal}`, populate: { path: 'ingredients.product' } }));
        days.forEach(day => mealCategories.forEach(meal => populates.push({ path: `weekly_plan.${day}.${meal}`, populate: { path: 'ingredients.product' } })));

        let patient = await Patient.findById(req.params.id)
            .populate(populates)
            .select('-password')
            .lean();

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const todayStr = new Date().toDateString();

        // 🌟 "NIGHTLY SNAPSHOT" & PRO PRE-FILL LOGIC
        if (patient.last_reset_date !== todayStr) {
            if (patient.last_reset_date) {
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

                if (!patient.historical_logs) patient.historical_logs = [];
                patient.historical_logs.push(snapshot);

                await Patient.findByIdAndUpdate(patient._id, {
                    $push: { historical_logs: snapshot }
                }, { strict: false });
            }

            const resetData = {
                "waterIntake": 0,
                "stepIntake": 0,
                "last_reset_date": todayStr,
                "recommended_meals.breakfast": [],
                "recommended_meals.lunch": [],
                "recommended_meals.dinner": [],
                "recommended_meals.snacks": []
            };

            patient.recommended_meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
            await Patient.findByIdAndUpdate(patient._id, { $set: resetData }, { strict: false });

            patient.waterIntake = 0;
            patient.stepIntake = 0;
            patient.last_reset_date = todayStr;
        }

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

        const patientMeals = patient.recommended_meals;
        if (patientMeals) {
            sumMacrosFromMeal(patientMeals.breakfast);
            sumMacrosFromMeal(patientMeals.lunch);
            sumMacrosFromMeal(patientMeals.dinner);
            sumMacrosFromMeal(patientMeals.snacks);
        }

        const dashboardData = {
            name: patient.name,
            username: patient.username, // 🌟 Ensure username is passed explicitly
            age: patient.age,
            height: patient.height,

            daily_budget: patient.daily_budget || 0,
            email: patient.email || '',
            phone: patient.phone || '',
            goal_intention: patient.goal_intention || 'Maintain',

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

            last_meal_update: patient.last_meal_update || null,

            historical_logs: patient.historical_logs || [],
            assigned_expert: patient.assigned_expert || null,
            pending_expert: patient.pending_expert || null,

            recommended_meals: patient.recommended_meals || { breakfast: [], lunch: [], dinner: [], snacks: [] },
            weekly_plan: patient.weekly_plan || {}
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