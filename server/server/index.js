const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const bcrypt = require("bcryptjs"); // ✅ tambahin
const { Schema } = mongoose;

dotenv.config();

const app = express();
const router = express.Router();

// Middleware
app.use(express.json());
app.use(cors());

// --- Koneksi ke MongoDB ---
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log('✅ Terhubung ke MongoDB Atlas!'))
  .catch(err => console.error('❌ Gagal terhubung ke MongoDB:', err));

/* ----------------------------
   SCORE MODEL
----------------------------- */
const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Score = mongoose.model('Score', scoreSchema);

/* ----------------------------
   USER MODEL
----------------------------- */
const userSchema = new Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt:{ type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

/* ----------------------------
   API ENDPOINTS
----------------------------- */

// === SCORE ===
router.post('/scores', async (req, res) => {
  try {
    const { name, score } = req.body;
    const newScore = new Score({ name, score });
    await newScore.save();
    res.status(201).send({ message: '✅ Skor berhasil disimpan!' });
  } catch (err) {
    console.error('❌ Error saat menyimpan skor:', err);
    res.status(500).send({ message: 'Gagal menyimpan skor.' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Score.find().sort({ score: -1 }).limit(10);
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error('❌ Error saat mengambil leaderboard:', err);
    res.status(500).send({ message: 'Gagal mengambil leaderboard.' });
  }
});

// Reset leaderboard (update score jadi 0)
router.put("/scores/reset", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(test);
    const scores = db.collection("scores");

    // update semua score jadi 0
    await scores.updateMany({}, { $set: { score: 0 } });

    res.status(200).send({ message: "✅ Skor leaderboard berhasil direset." });
  } catch (err) {
    console.error("❌ Error saat reset leaderboard:", err);
    res.status(500).send({ message: "Gagal reset leaderboard." });
  }
});


// === AUTH ===
// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // cek email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "✅ Registrasi berhasil",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("❌ Error saat register:", err);
    res.status(500).json({ message: "Terjadi kesalahan saat register" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // cari user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Password salah" });

    res.status(200).json({
      message: "✅ Login berhasil",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Error saat login:", err);
    res.status(500).json({ message: "Terjadi kesalahan saat login" });
  }
});

/* ----------------------------
   USE ROUTER
----------------------------- */
app.use('/api', router);

// Ekspor aplikasi sebagai serverless function
module.exports.handler = serverless(app);
