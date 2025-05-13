// routes/storyRoutes.js

const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// Create a new Story
router.post('/', async (req, res) => {
    try {
        const newStory = new Story(req.body);
        const savedStory = await newStory.save();
        res.status(201).json(savedStory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all Stories
router.get('/', async (req, res) => {
    try {
        const stories = await Story.find();
        res.status(200).json(stories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a Story by ID
router.get('/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        res.status(200).json(story);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Update a Story
router.put('/:id', async (req, res) => {
    try {
        const { title, author, description, genres, collaborators } = req.body;
        
        // Validate the incoming data (You can add more validation if needed)
        if (!title || !author || !description) {
            return res.status(400).json({ message: 'Title, author, and description are required' });
        }

        // Update the story
        const updatedStory = await Story.findByIdAndUpdate(req.params.id, {
            title,
            author,
            description,
            genres,
            collaborators
        }, { new: true, runValidators: true });

        if (!updatedStory) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.status(200).json(updatedStory);
    } catch (err) {
        console.error('Error updating story:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update a Story
router.put('/:id', async (req, res) => {
    try {
        const updatedStory = await Story.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedStory) return res.status(404).json({ message: 'Story not found' });
        res.status(200).json(updatedStory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a Story
router.delete('/:id', async (req, res) => {
    try {
        const story = await Story.findByIdAndDelete(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        res.status(200).json({ message: 'Story deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fetch stories by author email
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const userStories = await Story.find({ 'author.email': email });
        res.status(200).json(userStories);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stories.' });
    }
});


// Get a Story by ID
router.get('/stories/:storyId', async (req, res) => {
  try {
      const story = await Story.findById(req.params.storyId).populate('author'); // Adjust population as needed
      if (!story) {
          return res.status(404).json({ message: 'Story not found.' });
      }
      res.status(200).json(story);
  } catch (err) {
      console.error('Error fetching story:', err);
      res.status(500).json({ message: 'Server error while fetching story.' });
  }
});


// Get all Stories where a user is a collaborator
// Get all Stories where a user is a collaborator
router.get('/collaborator/:email', async (req, res) => {
    try {
        // Log the email to ensure it's being passed correctly
        const email = req.params.email;
        console.log("Received email:", email);

        // Find stories with the specified collaborator's email
        const stories = await Story.find({ "collaborators.email": email });

        if (stories.length === 0) {
            return res.status(404).json({ message: 'No stories found for this collaborator' });
        }

        res.status(200).json(stories);
    } catch (err) {
        console.error("Error fetching stories:", err); // Detailed logging for errors
        res.status(500).json({ message: err.message });
    }
});





module.exports = router;
