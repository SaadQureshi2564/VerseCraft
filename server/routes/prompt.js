const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// Create a new prompt for a selected project
router.post('/create', async (req, res) => {
  const { title, messages, projectId } = req.body;

  try {
    const prompt = new Prompt({
      title,
      messages,
      projectId,
    });

    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Fetch all prompts for a specific project
router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const prompts = await Prompt.find({ projectId });
    res.status(200).json(prompts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

module.exports = router;
