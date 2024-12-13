import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = express.Router();

// App routes
// Check if the server is running
router.get('/status', AppController.getStatus);

// Retrieve app statistics (e.g., number of users, files, etc.)
router.get('/stats', AppController.getStats);

// User routes
// Register a new user
router.post('/users', UsersController.postNew);

// Authentication routes
// Log in a user and generate a token
router.get('/connect', AuthController.getConnect);

// Log out a user by invalidating their token
router.get('/disconnect', AuthController.getDisconnect);

// File routes
router.post('/files', FilesController.postUpload);
router.get('/users/me', UsersController.getMe);

export default router;
