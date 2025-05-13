
// tests/publishingRouter.test.js
const request = require('supertest');
const express = require('express');
const publishingRouter = require('../routes/publishingRoutes');
const Publishing = require('../models/publishing');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(publishingRouter);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Publishing Router', () => {
  beforeEach(async () => {
    await Publishing.deleteMany({});
  });

  describe('POST /create/:projectId', () => {
    it('should create a new publishing', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/create/${projectId}`)
        .field('projectType', 'book')
        .field('title', 'Test Publishing')
        .field('shortTitle', 'Test')
        .field('summary', 'This is a summary')
        .field('genres', 'Fiction, Fantasy')
        .field('publishingType', 'Public')
        .field('audience', 'Adults');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Publishing.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const projectId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/create/${projectId}`)
        .field('projectType', 'book')
        .field('title', 'Test Publishing')
        .field('shortTitle', 'Test')
        .field('summary', 'This is a summary')
        .field('genres', 'Fiction, Fantasy')
        .field('publishingType', 'Public')
        .field('audience', 'Adults');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /returnall', () => {
    it('should get all publishings', async () => {
      const projectId1 = new mongoose.Types.ObjectId();
      const projectId2 = new mongoose.Types.ObjectId();
      const publishing1 = new Publishing({
        projectId: projectId1,
        projectType: 'book',
        title: 'Test Publishing 1',
      });
      await publishing1.save();
      const publishing2 = new Publishing({
        projectId: projectId2,
        projectType: 'article',
        title: 'Test Publishing 2',
      });
      await publishing2.save();

      const res = await request(app).get('/returnall');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should return 404 if there are no publishings', async () => {
      const res = await request(app).get('/returnall');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /:projectId', () => {
    it('should get a publishing by project ID', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const publishing = new Publishing({
        projectId,
        projectType: 'book',
        title: 'Test Publishing',
      });
      await publishing.save();

      const res = await request(app).get(`/${projectId}`);

      expect(res.status).toBe(200);
      expect(res.body.projectId).toBe(projectId.toString());
    });

    it('should return 404 if publishing is not found', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/${projectId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /:projectId', () => {
    it('should delete a publishing by project ID', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const publishing = new Publishing({
        projectId,
        projectType: 'book',
        title: 'Test Publishing',
      });
      await publishing.save();

      const res = await request(app).delete(`/${projectId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if publishing is not found', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/${projectId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /:id', () => {
    it('should get a publishing by ID', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const publishing = new Publishing({
        projectId,
        projectType: 'book',
        title: 'Test Publishing',
      });
      await publishing.save();

      const res = await request(app).get(`/${publishing._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if ID is invalid', async () => {
      const res = await request(app).get('/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if publishing is not found', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/${id}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
