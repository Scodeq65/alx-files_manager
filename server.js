// server.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const redis = require('redis');
const app = express();

// Load environment variables from .env
dotenv.config();

// Get the port from the environment variable or use default 5000
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (use your own connection string)
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Create Redis client and connect
const redisClient = redis.createClient(process.env.REDIS_URI);
redisClient.on('connect', () => {
  console.log('Redis connected');
});

const routes = require('./routes/index');

// Use routes
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
