
// tests/plotRoutes.test.js
const request = require('supertest');
const express = require('express');
const plotRoutes = require('../routes/PlotRoutes');
const Plot = require('../models/Plot');
const Chapter = require('../models/Chapter');
const Story = require('../models/Story');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(plotRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Plot Routes', () => {
  beforeEach(async () => {
    await Plot.deleteMany({});
    await Chapter.deleteMany({});
    await Story.deleteMany({});
  });

  describe('GET /api/chapters/:chapterId/plots', () => {
    it('should get all plots for a chapter', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter = new Chapter({
        story: story._id,
        number: 1,
        title: 'Test Chapter',
      });
      await chapter.save();

      const plot1 = new Plot({
        chapter: chapter._id,
        name: 'Plot 1',
      });
      await plot1.save();

      const plot2 = new Plot({
        chapter: chapter._id,
        name: 'Plot 2',
      });
      await plot2.save();

      const res = await request(app).get(`/api/chapters/${chapter._id}/plots`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should return 404 if chapter does not exist', async () => {
      const chapterId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/chapters/${chapterId}/plots`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Chapter not found');
    });
  });

  describe('POST /api/chapters/:chapterId/plots', () => {
    it('should create a new plot for a chapter', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter = new Chapter({
        story: story._id,
        number: 1,
        title: 'Test Chapter',
      });
      await chapter.save();

      const res = await request(app)
        .post(`/api/chapters/${chapter._id}/plots`)
        .send({ name: 'New Plot' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Plot');
    });

    it('should return 400 if plot name is missing', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter = new Chapter({
        story: story._id,
        number: 1,
        title: 'Test Chapter',
      });
      await chapter.save();

      const res = await request(app)
        .post(`/api/chapters/${chapter._id}/plots`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Plot name is required');
    });

    it('should return 404 if chapter does not exist', async () => {
      const chapterId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/chapters/${chapterId}/plots`)
        .send({ name: 'New Plot' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Chapter not found');
    });
  });

  describe('PUT /api/chapters/:chapterId/plots/:plotId', () => {
    it('should update a plot', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter = new Chapter({
        story: story._id,
        number: 1,
        title: 'Test Chapter',
      });
      await chapter.save();

      const plot = new Plot({
        chapter: chapter._id,
        name: 'Old Plot',
      });
      await plot.save();

      const res = await request(app)
        .put(`/api/chapters/${chapter._id}/plots/${plot._id}`)
        .send({ name: 'New Plot Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Plot Name');
    });

    it('should return 400 if plot name is missing', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter = new Chapter({
        story: story._id,
        number: 1,
        title: 'Test Chapter',
      });
      await chapter.save();

      const plot = new Plot({
        chapter: chapter._id,
        name: 'Old Plot',
      });
      await plot.save();

      const res = await request(app)
        .put(`/api/chapters/${chapter._id}/plots/${plot._id}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Plot name is required');
    });

    it('should return 404 if plot does not exist', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter = new Chapter({
        story: story._id,
        number: 1,
        title: 'Test Chapter',
      });
      await chapter.save();

      const plotId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/chapters/${chapter._id}/plots/${plotId}`)
        .send({ name: 'New Plot Name' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Plot not found');
    });
  });

  describe('DELETE /api/chapters/:chapterId/plots/:plotId', () => {
    it('should delete a plot', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter = new Chapter({
        story: story._id,
        number: 1,
        title: 'Test Chapter',
      });
      await chapter.save();

      const plot = new Plot({
        chapter: chapter._id,
        name: 'Plot to delete',
      });
      await plot.save();

      const res = await request(app).delete(`/api/chapters/${chapter._id}/plots/${plot._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Plot removed successfully.');
    });

    it('should return 404 if plot does not exist', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter = new Chapter({
        story: story._id,
        number: 1,
        title: 'Test Chapter',
      });
      await chapter.save();

      const plotId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/chapters/${chapter._id}/plots/${plotId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Plot not found');
    });
  });
});
