import request from 'supertest';
import app from '../server';

describe('Endpoints', () => {
  let token = null;

  beforeAll(async () => {
    // Authenticate and retrieve token
    const response = await request(app)
      .get('/connect')
      .auth('bob@dylan.com', 'toto1234!');
    token = response.body.token;
  });

  afterAll(async () => {
    // Disconnect
    await request(app).get('/disconnect').set('X-Token', token);
  });

  describe('GET /status', () => {
    it('should return status of the application', async () => {
      const response = await request(app).get('/status');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ redis: true, db: true });
    });
  });

  describe('GET /stats', () => {
    it('should return statistics of the application', async () => {
      const response = await request(app).get('/stats');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('files');
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/users')
        .send({ email: 'test_user@example.com', password: 'test_password' });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'test_user@example.com');
    });
  });

  describe('GET /connect', () => {
    it('should authenticate a user and return a token', async () => {
      const response = await request(app)
        .get('/connect')
        .auth('bob@dylan.com', 'toto1234!');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('GET /disconnect', () => {
    it('should disconnect an authenticated user', async () => {
      const response = await request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(response.status).toBe(204);
    });
  });

  describe('GET /users/me', () => {
    it('should return the authenticated user information', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('X-Token', token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });
  });

  describe('POST /files', () => {
    it('should upload a new file', async () => {
      const response = await request(app)
        .post('/files')
        .set('X-Token', token)
        .send({
          name: 'test_file.txt',
          type: 'file',
          data: 'VGhpcyBpcyBhIHRlc3QgZmlsZQ==', // Base64 for "This is a test file"
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /files/:id', () => {
    it('should retrieve file information by ID', async () => {
      const fileId = 'some_file_id';
      const response = await request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', fileId);
    });
  });

  describe('GET /files', () => {
    it('should retrieve files with pagination', async () => {
      const response = await request(app)
        .get('/files?page=0')
        .set('X-Token', token);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('PUT /files/:id/publish', () => {
    it('should publish a file', async () => {
      const fileId = 'some_file_id';
      const response = await request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isPublic', true);
    });
  });

  describe('PUT /files/:id/unpublish', () => {
    it('should unpublish a file', async () => {
      const fileId = 'some_file_id';
      const response = await request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isPublic', false);
    });
  });

  describe('GET /files/:id/data', () => {
    it('should retrieve file content', async () => {
      const fileId = 'some_file_id';
      const response = await request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token);
      expect(response.status).toBe(200);
      expect(response.text).toBe('This is a test file');
    });

    it('should retrieve a thumbnail by size', async () => {
      const fileId = 'some_file_id';
      const response = await request(app)
        .get(`/files/${fileId}/data?size=100`)
        .set('X-Token', token);
      expect(response.status).toBe(200);
    });
  });
});
