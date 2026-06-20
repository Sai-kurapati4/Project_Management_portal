const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { User, Task } = require('../models');

beforeAll(async () => {
  // Sync the in-memory SQLite database
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

describe('Mini Project Management Portal Backend APIs', () => {
  let userToken;
  let userId;
  let testTaskId;

  // 1. AUTHENTICATION TESTS
  describe('Auth Endpoints', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'tester',
          email: 'tester@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toEqual('tester');
      expect(res.body.email).toEqual('tester@example.com');
      userId = res.body.id;
    });

    it('should fail to register if user already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'tester',
          email: 'tester@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('exists');
    });

    it('should login user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'tester@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      userToken = res.body.token;
    });

    it('should fail to login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'tester@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Invalid');
    });
  });

  // 2. TASK PROTECTED ROUTES AND VALIDATIONS
  describe('Task Operations & Validations', () => {
    it('should block task retrieval without a JWT token', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toEqual(401);
    });

    it('should block task creation if title is empty', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '',
          description: 'This is a description that is long enough to pass validation.',
          status: 'Pending'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('title');
    });

    it('should block task creation if description is less than 20 characters', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Valid Task Title',
          description: 'Too short',
          status: 'Pending'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('at least 20 characters');
    });

    it('should create a task successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Build Login Page',
          description: 'Create a responsive login page using custom css styles.',
          status: 'Pending'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('Build Login Page');
      expect(res.body.status).toEqual('Pending');
      testTaskId = res.body.id;
    });

    it('should retrieve list of tasks for authorized user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('tasks');
      expect(res.body.tasks.length).toBeGreaterThan(0);
      expect(res.body.total).toEqual(1);
    });

    it('should retrieve correct statistics', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.total).toEqual(1);
      expect(res.body.pending).toEqual(1);
      expect(res.body.completed).toEqual(0);
    });

    it('should update task status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'Completed'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('Completed');
    });

    it('should retrieve completed task count in statistics after update', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.completed).toEqual(1);
      expect(res.body.pending).toEqual(0);
    });

    it('should delete the task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('deleted');
    });

    it('should return 0 tasks after deletion', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.tasks.length).toEqual(0);
    });
  });
});
