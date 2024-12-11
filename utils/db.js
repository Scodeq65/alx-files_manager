import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    // Get environment variables or use defaults
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // MongoDB connection URI
    const url = `mongodb://${host}:${port}`;

    // Create MongoDB client
    this.client = new MongoClient(url, { useUnifiedTopology: true });

    // Connect to MongoDB
    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        this.db = null;
      });
  }

  /**
   * Checks if the MongoDB client is connected
   * @returns {boolean} True if connected, otherwise false
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Gets the number of documents in the "users" collection
   * @returns {Promise<number>} The number of users
   */
  async nbUsers() {
    if (!this.db) return 0;
    try {
      return await this.db.collection('users').countDocuments();
    } catch (err) {
      console.error('Error counting users:', err);
      return 0;
    }
  }

  /**
   * Gets the number of documents in the "files" collection
   * @returns {Promise<number>} The number of files
   */
  async nbFiles() {
    if (!this.db) return 0;
    try {
      return await this.db.collection('files').countDocuments();
    } catch (err) {
      console.error('Error counting files:', err);
      return 0;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
