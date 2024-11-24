require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import the SeatReclined model
const SeatReclined = require('./models/SeatReclined');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => {
  console.error('Failed to connect to MongoDB Atlas:', err);
  // Consider handling the error without exiting the process
});


// Root Endpoint
app.get('/', (req, res) => {
    res.send('Seat Monitor Backend is running.');
});

// GET /api/seat-states Endpoint
app.get('/api/seat-states', async (req, res) => {
  try {
      const seatStates = await SeatReclined.find().sort({ timestamp: -1 });
      res.status(200).json(seatStates);
  } catch (err) {
      console.error('Error fetching seat states:', err);
      res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/seat-state Endpoint
app.post('/api/seat-state', async (req, res) => {
    console.log('Received POST request to /api/seat-state');
    const { state } = req.body;

    if (!state || !['Reclined', 'Normal'].includes(state)) {
        return res.status(400).json({ error: 'Invalid seat state.' });
    }

    try {
        const newSeatState = new SeatReclined({ state });
        await newSeatState.save();
        console.log('Seat state saved:', newSeatState);
        res.status(201).json({ message: 'Seat state recorded successfully.' });
    } catch (err) {
        console.error('Error saving seat state:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Seat Monitor Backend is running on port ${PORT}`);
});
