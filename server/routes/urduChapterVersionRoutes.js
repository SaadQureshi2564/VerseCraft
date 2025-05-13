// routes/urduChapterVersions.js

const express = require('express');
const router = express.Router();
const UrduChapterVersion = require('../models/UrduChapterVersion');
const UrduChapter = require('../models/UrduChapter'); // Assuming you have a chapter model

// Create a new version of a chapter
router.post('/', async (req, res) => {
  try {
    const { projectId, chapterId, createrName, content, versionName } = req.body;

    // Generate a unique version ID (you can use UUID or timestamp-based ID)
    const versionId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newVersion = new UrduChapterVersion({
      projectId,
      chapterId,
      createrName,
      versionId,
      content,
      versionName,
    });

    const savedVersion = await newVersion.save();
    res.status(201).json(savedVersion);
  } catch (error) {
    res.status(500).json({ message: 'Error creating version', error });
  }
});

// Get all versions for a chapter
router.get('/:projectId/:chapterId', async (req, res) => {
  try {
    const { projectId, chapterId } = req.params;
    const versions = await UrduChapterVersion.find({ projectId, chapterId }).sort({ createdAt: -1 });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching versions', error });
  }
});

// Select a version as current (update the chapter content)
router.put('/:projectId/:chapterId/:versionId', async (req, res) => {
  try {
    const { projectId, chapterId, versionId } = req.params;
    const { content } = req.body;

    // Find the version
    const version = await UrduChapterVersion.findOne({ projectId, chapterId, versionId });
    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Update the chapter content with the version content
    const chapter = await UrduChapter.findOneAndUpdate(
      { _id: chapterId, projectId },
      { content: version.content },
      { new: true }
    );

    res.json({ message: 'Version applied successfully', chapter });
  } catch (error) {
    res.status(500).json({ message: 'Error selecting version', error });
    }
});

module.exports = router;