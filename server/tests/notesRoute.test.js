// tests/noteRoutes.test.js
const request = require('supertest');
const express = require('express');
const noteRoutes = require('../routes/noteRoutes');
const Note = require('../models/Note');
const Chapter = require('../models/Chapter');
const Story = require('../models/Story');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(noteRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Note Routes', () => {
  beforeEach(async () => {
    await Note.deleteMany({});
    await Chapter.deleteMany({});
    await Story.deleteMany({});
  });

  describe('POST /stories/:storyId/chapters/:chapterId/notes', () => {
    it('should create a new note', async () => {
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
        .post(`/stories/${story._id}/chapters/${chapter._id}/notes`)
        .send({ content: 'Test Note' });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe('Test Note');
    });

    it('should return 400 if note content is empty', async () => {
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
        .post(`/stories/${story._id}/chapters/${chapter._id}/notes`)
        .send({ content: '' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Note content is required.');
    });

    it('should return 404 if chapter does not exist', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapterId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/stories/${story._id}/chapters/${chapterId}/notes`)
        .send({ content: 'Test Note' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Chapter not found');
    });
  });

  describe('GET /stories/:storyId/chapters/:chapterId/notes', () => {
    it('should get all notes for a chapter', async () => {
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

      const note1 = new Note({
        chapter: chapter._id,
        content: 'Test Note 1',
      });
      await note1.save();

      const note2 = new Note({
        chapter: chapter._id,
        content: 'Test Note 2',
      });
      await note2.save();

      const res = await request(app).get(`/stories/${story._id}/chapters/${chapter._id}/notes`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should return 404 if chapter does not exist', async () => {
      const story = new Story({
        title: 'Test Story',
        description: 'Test Description',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      await story.save();

      const chapterId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/stories/${story._id}/chapters/${chapterId}/notes`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Chapter not found');
    });
  });

  describe('DELETE /notes/:noteId', () => {
    it('should delete a note', async () => {
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

      const note = new Note({
        chapter: chapter._id,
        content: 'Test Note',
      });
      await note.save();

      const res = await request(app).delete(`/notes/${note._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Note deleted successfully.');
    });

    it('should return 404 if note does not exist', async () => {
      const noteId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/notes/${noteId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Note not found.');
    });
  });

  describe('PUT /notes/:noteId', () => {
    it('should update a note', async () => {
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

      const note = new Note({
        chapter: chapter._id,
        content: 'Test Note',
      });
      await note.save();

      const res = await request(app)
        .put(`/notes/${note._id}`)
        .send({ content: 'Updated Test Note' });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Updated Test Note');
    });

    it('should return 400 if note content is empty', async () => {
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

      const note = new Note({
        chapter: chapter._id,
        content: 'Test Note',
      });
      await note.save();

      const res = await request(app)
        .put(`/notes/${note._id}`)
        .send({ content: '' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Note content is required.');
    });

    it('should return 404 if note does not exist', async () => {
      const noteId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/notes/${noteId}`)
        .send({ content: 'Updated Test Note' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Note not found.');
    });
  });
});