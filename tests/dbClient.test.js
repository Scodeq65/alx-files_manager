import dbClient from '../utils/db';

describe('dbClient', () => {
  it('should return true for isAlive when MongoDB is running', () => {
    expect(dbClient.isAlive()).toBe(true);
  });

  it('should return the number of users in the collection', async () => {
    const count = await dbClient.nbUsers();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should return the number of files in the collection', async () => {
    const count = await dbClient.nbFiles();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
