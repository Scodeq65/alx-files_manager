import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Create Redis client
    this.client = redis.createClient({
      host: '127.0.0.1',
      port: 6379,
    });

    // Log any Redis client errors
    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err}`);
    });

    // Promisify Redis methods for async/await usage
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * Checks if Redis client is connected
   * @returns {boolean} True if connected, otherwise false
   */
  isAlive() {
    console.log(`Redis client connected: ${this.client.connected}`);
    return this.client.connected;
  }

  /**
   * Retrieves the value associated with a key
   * @param {string} key - The key to retrieve
   * @returns {Promise<string | null>} The value or null if not found
   */
  async get(key) {
    return this.getAsync(key);
  }

  /**
   * Stores a key-value pair with an expiration time
   * @param {string} key - The key to set
   * @param {string} value - The value to store
   * @param {number} duration - The expiration time in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  /**
   * Deletes a key from Redis
   * @param {string} key - The key to delete
   * @returns {Promise<void>}
   */
  async del(key) {
    await this.delAsync(key);
  }
}

// Export a single instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
