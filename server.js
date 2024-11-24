// server.js

require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import the SeatReclined model
const SeatReclined = require('./models/SeatReclined');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

// Global Request Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection

const connectWithRetry = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB Atlas:', err);
        console.log('⏳ Retrying in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// API Endpoints

/**
 * @route   POST /api/seat-state
 * @desc    Receive seat state data and store it in MongoDB
 * @access  Public
 */
app.post('/api/seat-state', async (req, res) => {
    console.log('📥 Received POST request to /api/seat-state');
    const { state } = req.body;

    // Validate the 'state' field
    if (!state || !['Reclined', 'Normal'].includes(state)) {
        console.log('⚠️ Invalid seat state received:', state);
        return res.status(400).json({ error: 'Invalid seat state.' });
    }

    try {
        // Create a new seat state document
        const newSeatState = new SeatReclined({ state });
        await newSeatState.save();
        console.log('✅ Seat state saved:', newSeatState);
        res.status(201).json({ message: 'Seat state recorded successfully.' });
    } catch (err) {
        console.error('❌ Error saving seat state:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

/**
 * @route   GET /api/seat-states
 * @desc    Retrieve all seat state data from MongoDB
 * @access  Public
 */
app.get('/api/seat-states', async (req, res) => {
    console.log('📥 Received GET request to /api/seat-states');
    try {
        const seatStates = await SeatReclined.find().sort({ timestamp: -1 });
        console.log(`✅ Retrieved ${seatStates.length} seat states`);
        res.status(200).json(seatStates);
    } catch (err) {
        console.error('❌ Error fetching seat states:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

/**
 * @route   GET /
 * @desc    Serve the frontend dashboard
 * @access  Public
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handling Middleware (Optional)
// This catches errors not handled by the routes above
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
