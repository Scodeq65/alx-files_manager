import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email
    if (!email) {
        return res.status(400).json({ error: 'Missing email' });
    }

    // Validate Password
    if (!password) {
        return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the email already exit in the db
    const userExits = await dbClient.db.collection('users').findOne({ email });
    if (userExits) {
        return res.status(400).json({ error: 'Already exit' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Create a newUser
    const newUser = {
        email,
        password: hashedPassword,
    };

    // Insert the new user into the database
    const result = await dbClient.db.collection('users').insertOne(newUser);

    // Return the craeted user's details
    return res.status(201).json({ id: result.insertId, email });
  }
}

export default UsersController;