import redisClient from '../utils/redis';

describe('redisClient', () => {
  it('should return true for isAlive when Redis is running', async () => {
    expect(redisClient.isAlive()).toBe(true);
  });

  it('should set and get a value in Redis', async () => {
    await redisClient.set('test_key', 'test_value', 10);
    const value = await redisClient.get('test_key');
    expect(value).toBe('test_value');
  });

  it('should delete a value in Redis', async () => {
    await redisClient.set('delete_key', 'delete_value', 10);
    await redisClient.del('delete_key');
    const value = await redisClient.get('delete_key');
    expect(value).toBe(null);
  });
});
