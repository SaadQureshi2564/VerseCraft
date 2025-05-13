const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel');

// Create a new Novel
router.post('/', async (req, res) => {
  try {
      const newNovel = new Novel(req.body);
      const savedNovel = await newNovel.save();
      res.status(201).json(savedNovel);
  } catch (err) {
      console.error('Error saving novel:', err);  // Log the detailed error
      res.status(400).json({ message: err.message });
  }
});


// Get all Novels
router.get('/', async (req, res) => {
    try {
        const novels = await Novel.find();
        res.status(200).json(novels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a Novel by ID
router.get('/:id', async (req, res) => {
    try {
        const novel = await Novel.findById(req.params.id);
        if (!novel) return res.status(404).json({ message: 'Novel not found' });
        res.status(200).json(novel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a Novel
router.put('/:id', async (req, res) => {
    try {
        const updatedNovel = await Novel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedNovel) return res.status(404).json({ message: 'Novel not found' });
        res.status(200).json(updatedNovel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a Novel
router.delete('/:id', async (req, res) => {
    try {
        const novel = await Novel.findByIdAndDelete(req.params.id);
        if (!novel) return res.status(404).json({ message: 'Novel not found' });
        res.status(200).json({ message: 'Novel deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fetch novels by author email
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const userNovels = await Novel.find({ 'author.email': email });
        res.status(200).json(userNovels);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch novels.' });
    }
});

// Get a Novel by ID
router.get('/novels/:novelId', async (req, res) => {
  try {
      const novel = await Novel.findById(req.params.novelId).populate('author'); // Adjust population as needed
      if (!novel) {
          return res.status(404).json({ message: 'Novel not found.' });
      }
      res.status(200).json(novel);
  } catch (err) {
      console.error('Error fetching novel:', err);
      res.status(500).json({ message: 'Server error while fetching novel.' });
  }
});



// Get novels by collaborator email
router.get('/collaborator/:email', async (req, res) => {
    const collaboratorEmail = req.params.email.toLowerCase();
    try {
        const novels = await Novel.find({ 
            'collaborators.email': collaboratorEmail 
        });
        if (novels.length === 0) {
            return res.status(404).json({ message: 'No novels found for the given collaborator email' });
        }
        res.status(200).json(novels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
