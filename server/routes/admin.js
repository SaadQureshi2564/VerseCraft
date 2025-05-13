// routes/admin.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Novel = require('../models/Novel');



// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a user
router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all novels
router.get('/novels', async (req, res) => {
  try {
    const novels = await Novel.find({});
    res.json(novels);
  } catch (err) {
    console.error('Error fetching novels:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a novel
router.delete('/novels/:id', async (req, res) => {
  try {
    await Novel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Novel deleted successfully.' });
  } catch (err) {
    console.error('Error deleting novel:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a novel
router.put('/novels/:id', async (req, res) => {
  try {
    const updatedNovel = await Novel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedNovel) {
      return res.status(404).json({ message: 'Novel not found.' });
    }
    res.json(updatedNovel);
  } catch (err) {
    console.error('Error updating novel:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
