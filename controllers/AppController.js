// controllers/AppController.js
const mongoose = require('mongoose');
const redis = require('redis');

// Assuming you have your User and File models
const User = mongoose.model('User');
const File = mongoose.model('File');

const redisClient = redis.createClient(process.env.REDIS_URI);

// Controller to check if Redis and DB are alive
exports.getStatus = async (req, res) => {
  try {
    // Check if Redis is alive
    redisClient.ping((err, reply) => {
      if (err || reply !== 'PONG') {
        return res.status(500).json({ redis: false, db: true });
      }
      
      // Check if DB is alive
      mongoose.connection.db.admin().ping((err, result) => {
        if (err || !result.ok) {
          return res.status(500).json({ redis: true, db: false });
        }
        return res.status(200).json({ redis: true, db: true });
      });
    });
  } catch (error) {
    res.status(500).json({ redis: false, db: false });
  }
};

// Controller to get the stats for users and files
exports.getStats = async (req, res) => {
  try {
    // Count the number of users
    const usersCount = await User.countDocuments();
    // Count the number of files
    const filesCount = await File.countDocuments();

    return res.status(200).json({
      users: usersCount,
      files: filesCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
};
