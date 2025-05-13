
// tests/characterRoute.test.js
const request = require('supertest');
const express = require('express');
const characterRouter = require('../routes/CharacterRouter');
const Character = require('../models/CharacterModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(characterRouter);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Character Router', () => {
  beforeEach(async () => {
    await Character.deleteMany({});
  });

  describe('POST /', () => {
    it('should create a new character', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/')
        .field('projectId', projectId.toString())
        .field('fullName', 'John Doe')
        .field('age', 30)
        .field('gender', 'male')
        .field('ethnicity', 'Asian')
        .field('summary', 'This is a summary')
        .field('backstory', 'This is a backstory');

      expect(res.status).toBe(201);
      expect(res.body.fullName).toBe('John Doe');
    });
  });

  describe('GET /', () => {
    it('should get all characters for a project', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const character1 = new Character({
        projectId,
        fullName: 'John Doe',
        age: 30,
        gender: 'male',
        ethnicity: 'Asian',
        summary: 'This is a summary',
        backstory: 'This is a backstory',
      });
      await character1.save();

      const character2 = new Character({
        projectId,
        fullName: 'Jane Doe',
        age: 25,
        gender: 'female',
        ethnicity: 'Caucasian',
        summary: 'This is a summary',
        backstory: 'This is a backstory',
      });
      await character2.save();

      const res = await request(app).get(`/?projectId=${projectId}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /:id', () => {
    it('should get a single character by ID', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const character = new Character({
        projectId,
        fullName: 'John Doe',
        age: 30,
        gender: 'male',
        ethnicity: 'Asian',
        summary: 'This is a summary',
        backstory: 'This is a backstory',
      });
      await character.save();

      const res = await request(app).get(`/${character._id}`);

      expect(res.status).toBe(200);
      expect(res.body.fullName).toBe('John Doe');
    });
  });

  describe('PUT /:id', () => {
    it('should update a character', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const character = new Character({
        projectId,
        fullName: 'John Doe',
        age: 30,
        gender: 'male',
        ethnicity: 'Asian',
        summary: 'This is a summary',
        backstory: 'This is a backstory',
      });
      await character.save();

      const res = await request(app)
        .put(`/${character._id}`)
        .field('fullName', 'Jane Doe');

      expect(res.status).toBe(200);
      expect(res.body.fullName).toBe('Jane Doe');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a character', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const character = new Character({
        projectId,
        fullName: 'John Doe',
        age: 30,
        gender: 'male',
        ethnicity: 'Asian',
        summary: 'This is a summary',
        backstory: 'This is a backstory',
      });
      await character.save();

      const res = await request(app).delete(`/${character._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Character deleted successfully');
    });
  });
});
