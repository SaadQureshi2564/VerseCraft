// routes/NovelChapterRouter.js

const express = require('express');
const router = express.Router();
const NovelChapter = require('../models/NovelChapter');

// Create a new chapter
router.post('/chapters', async (req, res) => {
  const { projectId, title, content } = req.body;
  try {
    const chapter = new NovelChapter({ projectId, title, content });
    await chapter.save();
    res.status(201).json(chapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all chapters for a project
router.get('/chapters/:projectId', async (req, res) => {
  try {
    const chapters = await NovelChapter.find({ projectId: req.params.projectId });
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific chapter by ID
router.get('/chapters/:projectId/:id', async (req, res) => {
  try {
    const chapter = await NovelChapter.findOne({ _id: req.params.id, projectId: req.params.projectId });
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a chapter
router.put('/chapters/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const chapter = await NovelChapter.findByIdAndUpdate(
      req.params.id,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    res.json(chapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a chapter
router.delete('/chapters/:id', async (req, res) => {
  try {
    await NovelChapter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chapter deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
