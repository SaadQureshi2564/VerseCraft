// routes/urduChapters.js
const express = require('express');
const router = express.Router();
const UrduChapter = require('../models/UrduChapter');

// @route   POST /api/chapters
// @desc    Create a new chapter
router.post('/', async (req, res) => {
  const { projectId, title, number, content, summary } = req.body;

  try {
    const newChapter = new UrduChapter({
      projectId,
      title,
      number,
      content,
      summary,
    });

    const chapter = await newChapter.save();
    res.json(chapter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/chapters/:projectId
// @desc    Get all chapters for a project
router.get('/:projectId', async (req, res) => {
  try {
    const chapters = await UrduChapter.find({ projectId: req.params.projectId }).sort({ number: 1 });
    res.json(chapters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/chapters/:projectId/:chapterId
// @desc    Get a single chapter by ID
router.get('/:projectId/:chapterId', async (req, res) => {
  try {
    const chapter = await UrduChapter.findOne({
      _id: req.params.chapterId,
      projectId: req.params.projectId,
    });

    if (!chapter) {
      return res.status(404).json({ msg: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Chapter not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/chapters/:projectId/:chapterId
// @desc    Update a chapter
router.put('/:projectId/:chapterId', async (req, res) => {
  const { title, number, content, summary } = req.body;

  // Build chapter object
  const chapterFields = {};
  if (title) chapterFields.title = title;
  if (number) chapterFields.number = number;
  if (content) chapterFields.content = content;
  if (summary) chapterFields.summary = summary;

  try {
    let chapter = await UrduChapter.findOne({
      _id: req.params.chapterId,
      projectId: req.params.projectId,
    });

    if (!chapter) {
      return res.status(404).json({ msg: 'Chapter not found' });
    }

    chapter = await UrduChapter.findByIdAndUpdate(
      req.params.chapterId,
      { $set: chapterFields },
      { new: true }
    );

    res.json(chapter);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Chapter not found' });
    }
    res.status(500).send('Server Error');
  }
});
// @route   DELETE /api/chapters/:projectId/:chapterId
// @desc    Delete a chapter
router.delete('/:projectId/:chapterId', async (req, res) => {
  try {
    const chapter = await UrduChapter.findOne({
      _id: req.params.chapterId,
      projectId: req.params.projectId,
    });

    if (!chapter) {
      return res.status(404).json({ msg: 'Chapter not found' });
    }

    await UrduChapter.deleteOne({ _id: req.params.chapterId });

    res.json({ msg: 'Chapter removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Chapter not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
