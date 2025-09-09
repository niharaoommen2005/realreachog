const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); // allow requests from frontend
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-memory storage for demo
let donations = [];

// Add donation
app.post('/add-donation', upload.single('image'), (req, res) => {
  const { itemName, category, description, phone } = req.body;
  const image = req.file ? req.file.filename : '';

  if (!itemName) return res.status(400).json({ error: 'Item Name required' });

  const newDonation = { itemName, category, description, phone, image };
  donations.push(newDonation);

  res.json(newDonation);
});

// Get all donations
app.get('/donations', (req, res) => {
  res.json(donations);
});

app.listen(4000, () => console.log('Backend running on port 4000'));
