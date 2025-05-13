
// tests/userRoutes.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userRoutes = require('../routes/users');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('User Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /users/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/users/signup')
        .field('fullname', 'John Doe')
        .field('email', 'john@example.com')
        .field('password', 'password123')
        .field('age', 30)
        .field('gender', 'male')
        .field('phone', '1234567890')
        .field('description', 'Test user');

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully!');
    });

    it('should return an error if email already exists', async () => {
      const user = new User({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        gender: 'male',
        age: 30,
      });
      await user.save();

      const res = await request(app)
        .post('/users/signup')
        .field('fullname', 'John Doe')
        .field('email', 'john@example.com')
        .field('password', 'password123')
        .field('age', 30)
        .field('gender', 'male')
        .field('phone', '1234567890')
        .field('description', 'Test user');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already in use');
    });
  });

  describe('POST /users/login', () => {
    it('should login a user', async () => {
      const user = new User({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        gender: 'male',
        age: 30,
      });
      await user.save();

      const res = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).not.toBeNull();
      expect(res.body.message).toBe('Login successful');
    });

    it('should return an error if credentials are invalid', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /users/all', () => {
    it('should get all users', async () => {
      const user1 = new User({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        gender: 'male',
        age: 30,
      });
      await user1.save();

      const user2 = new User({
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567891',
        gender: 'female',
        age: 25,
      });
      await user2.save();

      const res = await request(app).get('/users/all');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /users/get-collaborators', () => {
    it('should get collaborators', async () => {
      const user1 = new User({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        gender: 'male',
        age: 30,
      });
      await user1.save();

      const user2 = new User({
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567891',
        gender: 'female',
        age: 25,
      });
      await user2.save();

      const res = await request(app).get('/users/get-collaborators');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /users/profile', () => {
    it('should get user profile', async () => {
      const user = new User({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        gender: 'male',
        age: 30,
      });
      await user.save();

      const resLogin = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });

      const token = resLogin.body.token;

      const res = await request(app)
        .get('/users/profile')
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.fullname).toBe('John Doe');
    });

    it('should return an error if not authenticated', async () => {
      const res = await request(app).get('/users/profile');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user profile', async () => {
      const user = new User({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        gender: 'male',
        age: 30,
      });
      await user.save();

      const resLogin = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });

      const token = resLogin.body.token;

      const res = await request(app)
        .put('/users/profile')
        .set("Authorization", `Bearer ${token}`)
        .field('fullname', 'Jane Doe')
        .field('email', 'jane@example.com')
        .field('age', 30)
        .field('gender', 'male')
        .field('phone', '1234567890');

      expect(res.status).toBe(200);
      expect(res.body.fullname).toBe('Jane Doe');
    });

    it('should return an error if not authenticated', async () => {
      const res = await request(app).put('/users/profile');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /users/change-password', () => {
    it('should change user password', async () => {
      const user = new User({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        gender: 'male',
        age: 30,
      });
      await user.save();

      const resLogin = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });

      const token = resLogin.body.token;

      const res = await request(app)
        .put('/users/change-password')
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: 'password123', newPassword: 'newpassword' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password updated successfully');
    });

    it('should return an error if current password is incorrect', async () => {
      const user = new User({
        fullname: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        gender: 'male',
        age: 30,
      });
      await user.save();

      const resLogin = await request(app)
        .post('/users/login')
        .send({ email: 'john@example.com', password: 'password123' });

      const token = resLogin.body.token;

      const res = await request(app)
        .put('/users/change-password')
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Current password is incorrect');
    });
  });
});
