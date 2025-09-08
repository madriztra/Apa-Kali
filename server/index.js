const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http'); 

dotenv.config();

const app = express();
const router = express.Router(); 

// Middleware
// Penting: Tambahkan kembali middleware ini
app.use(cors());

// --- Koneksi ke MongoDB ---
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log('Terhubung ke MongoDB Atlas!'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- Definisi Skema dan Model ---
const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Score = mongoose.model('Score', scoreSchema);

// --- API Endpoint (gunakan router) ---
router.post('/scores', async (req, res) => {
    try {
        const { name, score } = req.body;
        const newScore = new Score({ name, score });
        await newScore.save();
        res.status(201).send({ message: 'Skor berhasil disimpan!' });
    } catch (err) {
        res.status(500).send({ message: 'Gagal menyimpan skor.' });
    }
});

router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Score.find().sort({ score: -1 }).limit(10);
        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).send({ message: 'Gagal mengambil data leaderboard.' });
    }
});

router.delete('/scores/reset', async (req, res) => {
    try {
        await Score.deleteMany({});
        res.status(200).send({ message: 'Leaderboard berhasil direset.' });
    } catch (err) {
        res.status(500).send({ message: 'Gagal mereset leaderboard.' });
    }
});

app.use('/api', router);

// Eksport aplikasi Anda sebagai fungsi serverless
module.exports.handler = serverless(app);
