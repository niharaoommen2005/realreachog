// index.js
require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors"); // <-- added for CORS

const app = express();
app.use(express.json());
app.use(cors()); // allow requests from any origin

// Initialize Firebase Admin with service account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ==========================
// Test route
// ==========================
app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});

// ==========================
// User Signup Route (Firestore only)
// ==========================
app.post("/signup/user", async (req, res) => {
  try {
    const { name, email, location, skills, interests } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const newUser = {
      name,
      email,
      createdAt: new Date(),
    };

    const userRef = await db.collection("users").add(newUser);

    res.status(201).json({ message: "User created", id: userRef.id });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
// ==========================
// User Login Route
// ==========================
app.post("/login/user-auth", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Firebase Admin SDK cannot verify passwords directly
    // We'll use Firebase Auth REST API for login
    const axios = require("axios");

    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY; // put this in your .env
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });

    res.status(200).json({
      message: "Login successful",
      uid: response.data.localId,
      token: response.data.idToken,
    });

  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    res.status(401).json({ error: "Invalid email or password" });
  }
});


// ==========================
// User Signup with Firebase Auth
// ==========================
app.post("/signup/user-auth", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save user details in Firestore
    const newUser = {
      uid: userRecord.uid,
      name,
      email,
      createdAt: new Date(),
    };

    await db.collection("users").doc(userRecord.uid).set(newUser);

    res.status(201).json({ message: "User created with Auth", uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating user with Auth:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================
// NGO Signup Route
// ==========================
app.post("/signup/ngo", async (req, res) => {
  try {
    const { name, email, registrationNo, city } = req.body;

    if (!name || !registrationNo) {
      return res.status(400).json({ error: "Name and Registration No. are required" });
    }

    const newNgo = {
      name,
      email,
      registrationNo,
      city,
      verified: false, // default until admin verifies
      createdAt: new Date(),
    };

    const ngoRef = await db.collection("ngos").add(newNgo);

    res.status(201).json({ message: "NGO created", id: ngoRef.id });
  } catch (error) {
    console.error("Error creating NGO:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==========================
// Start server
// ==========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
