// tests/getChapterRoute.test.js
const request = require('supertest');
const express = require('express');
const chapterRoutes = require('../routes/getChapter');
const Story = require('../models/Story');
const Novel = require('../models/Novel');
const Chapter = require('../models/Chapter');
const NovelChapter = require('../models/NovelChapter');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', chapterRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Chapter Routes', () => {
  beforeEach(async () => {
    await Story.deleteMany({});
    await Novel.deleteMany({});
    await Chapter.deleteMany({});
    await NovelChapter.deleteMany({});
  });

  describe('GET /api/:projectId/chapters', () => {
    it('should get chapters for a story', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapter1 = new Chapter({
        story: story._id,
        number: 1,
        title: 'Chapter 1',
      });
      await chapter1.save();

      const chapter2 = new Chapter({
        story: story._id,
        number: 2,
        title: 'Chapter 2',
      });
      await chapter2.save();

      const res = await request(app).get(`/api/${story._id}/chapters`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should get chapters for a novel', async () => {
      const novel = new Novel({
        title: 'Test Novel',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await novel.save();

      const chapter1 = new NovelChapter({
        projectId: novel._id,
        number: 1,
        title: 'Chapter 1',
      });
      await chapter1.save();

      const chapter2 = new NovelChapter({
        projectId: novel._id,
        number: 2,
        title: 'Chapter 2',
      });
      await chapter2.save();

      const res = await request(app).get(`/api/${novel._id}/chapters`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should return 404 if project not found', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/${projectId}/chapters`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found.');
    });

    it('should return empty array if no chapters found', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const res = await request(app).get(`/api/${story._id}/chapters`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });
});