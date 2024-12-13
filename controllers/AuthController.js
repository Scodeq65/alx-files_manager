import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import sha1 from 'sha1';

class AuthController {
  /**
   * GET /connect
   * Signs in a user and generates an authentication token.
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hashedPassword = sha1(password);

    try {
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const redisKey = `auth_${token}`;

      await redisClient.set(redisKey, user._id.toString(), 86400); // Token valid for 24 hours

      return res.status(200).json({ token });
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /disconnect
   * Signs out a user by deleting their authentication token.
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;

    try {
      const userId = await redisClient.get(redisKey);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(redisKey);
      return res.status(204).send();
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
